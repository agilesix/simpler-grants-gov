import type { Model, ModelProperty, Program, Scalar } from "@typespec/compiler";
import {
  type Block, blockAncestry, childBlock, modelProperties, propCalculationMaterialization,
  propComputed, propComputedFrom, propEvaluationOrder, propNotBefore, propOmit, propTotals,
  readBlock, typeTags,
} from "simpler-forms";
import { modelPrePopulate } from "./model.js";

const OP_RULE: Record<string, string> = {
  Sum: "sum_monetary",
  Subtract: "subtract_monetary",
  PercentOf: "multiply_by_percentage",
};

function hasTypeTag(
  program: Program,
  type: ModelProperty["type"],
  tag: string,
): boolean {
  if (type.kind === "Model") return typeTags(program, type).includes(tag);
  if (type.kind !== "Scalar") return false;
  let scalar: Scalar | undefined = type;
  while (scalar) {
    if (typeTags(program, scalar).includes(tag)) return true;
    scalar = scalar.baseScalar;
  }
  return false;
}

function calculationRule(program: Program, prop: ModelProperty, operator: string): string {
  if (operator === "Sum" && hasTypeTag(program, prop.type, "count")) return "sum_integer";
  return OP_RULE[operator] ?? "sum_monetary";
}

/** Question ids whose presence implies a submit-time stamp (Tier 2, inferred). */
const STAMP_BY_QUESTION: Record<string, string> = {
  "generics/signature": "signature",
  "generics/submitted-date": "current_date",
};

/**
 * The attachment question, wherever it appears, implies SGG's attachment validation rule.
 * Inferred from the question's identity rather than from the shape of its type: an
 * attachment is a string carrying a file id, and so is a great many other things.
 */
const ATTACHMENT_QUESTION = "generics/attachment";

/**
 * One calculation. `emit` is what SGG reads; `resolve` is the same reference with the
 * array marker and the `@THIS.` shorthand removed, so that one calculation can be
 * recognized as depending on another.
 */
interface Reference {
  emit: string;
  resolve: string;
}

interface Calculation {
  /** Where the rule lands in the emitted tree, as snake-cased key parts. */
  at: string[];
  rule: string;
  refs: Reference[];
  explicitOrder?: number;
  materialize?: "when_any_source_present";
}

type Json = Record<string, unknown>;

/**
 * The complete SGG rule schema in one pass: calculations, inferred attachment validation,
 * inferred submit stamps, and declared external lookups. One producer, so the adapter
 * passes it through rather than merging into it.
 *
 * Almost none of it is written down. The attachment rule follows from a property composing
 * the attachment question; the two submit stamps from the signature and submitted-date
 * questions; a whole budget column from one `@Validation.totals`; and evaluation order
 * from how deep a calculation's dependencies go. What remains declared is only what is
 * genuinely a choice: which external source pre-populates a field.
 */
export function emitSggRules(program: Program, block: Block): Json {
  if (block.model.kind !== "Model") return {};

  const out: Json = {};
  const calculations: Calculation[] = [];
  const modelPath = new Map<Model, string[]>([[block.model, []]]);
  const context: Context = {
    prePopulate: modelPrePopulate(program, block.model),
    calculations,
    modelPath,
  };

  walk(program, block.model, [], "", out, context, true);

  // Evaluation order is a property of the dependency graph, not of the author's memory.
  const depths = new Map<string, number>();
  const byPath = new Map(calculations.map((c) => [c.at.join("."), c]));
  for (const calculation of calculations) {
    const rule: Json = {
      rule: calculation.rule,
    };
    const sourceFields = calculation.refs.map((r) => r.emit);
    if (calculation.rule === "multiply_by_percentage") {
      rule.amount = sourceFields[0];
      rule.percentage = sourceFields[1];
    } else {
      rule.fields = sourceFields;
    }
    if (calculation.materialize) {
      rule.materialize = calculation.materialize;
      // Presence is a separate contract from formula evaluation. The adapter follows these
      // references through any calculated dependencies to their entered source values, so an
      // eagerly materialized intermediate zero cannot manufacture presence.
      rule.presence_fields = sourceFields;
    }
    const order = calculation.explicitOrder ?? depth(calculation.at.join("."), byPath, depths, new Set());
    if (calculation.explicitOrder !== undefined || order >= 2) rule.order = order;
    place(out, calculation.at, { gg_pre_population: rule });
  }
  return out;
}

/** How many rounds of evaluation this calculation has to wait for. */
function depth(
  path: string,
  byPath: Map<string, Calculation>,
  memo: Map<string, number>,
  visiting: Set<string>,
): number {
  const cached = memo.get(path);
  if (cached !== undefined) return cached;
  const calculation = byPath.get(path);
  if (!calculation) return 0;
  // A cycle has no well-defined order. Report it as depth 1 rather than looping; the
  // linter is where a cycle should be caught and named.
  if (visiting.has(path)) return 1;
  visiting.add(path);
  const deepest = calculation.refs.reduce(
    (worst, ref) => Math.max(worst, depth(ref.resolve, byPath, memo, visiting)),
    0,
  );
  visiting.delete(path);
  const result = deepest + 1;
  memo.set(path, result);
  return result;
}

/** The subtree at `at`, or undefined if nothing was written there. */
function dig(root: Json, at: string[]): Json | undefined {
  let node: Json | undefined = root;
  for (const part of at) node = node?.[part] as Json | undefined;
  return node;
}

function place(root: Json, at: string[], value: Json): void {
  let node = root;
  for (const part of at.slice(0, -1)) {
    node = (node[part] as Json) ?? ((node[part] = {}) as Json);
  }
  Object.assign((node[at.at(-1)!] as Json) ?? (node[at.at(-1)!] = {}), value);
}

/** What the walk needs from the form as a whole. */
interface Context {
  /** Canonical data path -> SGG rule name, from `@Sgg.prePopulate` on the form. */
  prePopulate: Record<string, string>;
  calculations: Calculation[];
  modelPath: Map<Model, string[]>;
}

function walk(
  program: Program,
  model: Model,
  at: string[],
  dataPath: string,
  into: Json,
  context: Context,
  atRoot: boolean,
): void {
  const { calculations, modelPath } = context;
  const properties = readBlock(program, model) ? [...model.properties.values()] : modelProperties(model);
  for (const prop of properties.filter((p) => !propOmit(program, p))) {
    const key = prop.name;
    const here = [...at, key];
    const path = dataPath ? `${dataPath}.${prop.name}` : prop.name;
    const child = childBlock(program, prop);

    const notBefore = propNotBefore(program, prop);
    if (notBefore) {
      place(into, here, {
        gg_validation: {
          rule: "date_not_before",
          fields: [atRoot ? notBefore.name : `@THIS.${notBefore.name}`],
        },
      });
    }

    const totals = propTotals(program, prop);
    if (totals && child && !child.scalar && child.model.kind === "Model") {
      collectTotals(program, prop, child, here, at, modelPath, calculations);
      continue;
    }

    const computed = propComputed(program, prop);
    if (computed) {
      calculations.push({
        at: here,
        rule: calculationRule(program, prop, computed.operator),
        explicitOrder: propEvaluationOrder(program, prop),
        materialize: propCalculationMaterialization(program, prop),
        refs: computed.refs.map((name) => ({
          // A sibling reference is spelled `@THIS.` everywhere but the form's own root.
          emit: atRoot ? name : `@THIS.${name}`,
          resolve: [...at, name].join("."),
        })),
      });
      continue;
    }

    const computedFrom = propComputedFrom(program, prop);
    if (computedFrom) {
      calculations.push({
        at: here,
        rule: calculationRule(program, prop, computedFrom.operator),
        explicitOrder: propEvaluationOrder(program, prop),
        materialize: propCalculationMaterialization(program, prop),
        refs: computedFrom.paths.map((path) => {
          const rootPath = path.startsWith("/");
          const parentPath = path.startsWith("../");
          const canonical = rootPath ? path.slice(1) : parentPath ? path.slice(3) : path;
          const parentAt = at.slice(0, -1);
          const emitted = parentPath
            ? parentAt.length ? `@PARENT.${canonical}` : canonical
            : rootPath || atRoot ? canonical : `@THIS.${canonical}`;
          const resolved = rootPath
            ? canonical.replaceAll("[*]", "")
            : parentPath
              ? [...parentAt, canonical.replaceAll("[*]", "")].join(".")
            : [...at, canonical.replaceAll("[*]", "")].join(".");
          return { emit: emitted, resolve: resolved };
        }),
      });
      continue;
    }

    if (child) {
      const ancestry = blockAncestry(program, child.model);
      const stamp = ancestry.map((id) => STAMP_BY_QUESTION[id]).find(Boolean);
      if (stamp) {
        place(into, here, { gg_post_population: { rule: stamp } });
        continue;
      }
      if (ancestry.includes(ATTACHMENT_QUESTION)) {
        place(into, here, { gg_validation: { rule: "attachment" } });
        continue;
      }
      if (child.scalar) {
        const rule = context.prePopulate[path];
        if (rule) place(into, here, { gg_pre_population: { rule } });
        continue;
      }
      modelPath.set(child.model as Model, here);
      walk(program, child.model as Model, here, path, into, context, false);
      continue;
    }

    // A repeatable list of objects: SGG marks the node so its rules apply per entry.
    if (prop.type.kind === "Model" && prop.type.indexer) {
      const item = prop.type.indexer.value;
      const itemBlock =
        item.kind === "Model" || item.kind === "Scalar" ? readBlock(program, item) : undefined;
      if (itemBlock && blockAncestry(program, itemBlock.model).includes(ATTACHMENT_QUESTION)) {
        place(into, here, { gg_validation: { rule: "attachment" } });
        continue;
      }
      if (item.kind === "Model") {
        // Walk into a throwaway tree first: the node is only marked as an array if the
        // entries turn out to carry rules.
        const nested: Json = {};
        const nestedCalculations: Calculation[] = [];
        modelPath.set(item, here);
        walk(program, item, here, path, nested, { ...context, calculations: nestedCalculations }, false);
        const entryRules = (dig(nested, here) ?? {}) as Json;
        if (Object.keys(entryRules).length || nestedCalculations.length) {
          place(into, here, { gg_type: "array", ...entryRules });
          calculations.push(...nestedCalculations);
        }
      }
      continue;
    }

    if (prop.type.kind === "Model") {
      modelPath.set(prop.type, here);
      walk(program, prop.type, here, path, into, context, false);
      continue;
    }

    const rule = context.prePopulate[path];
    if (rule) place(into, here, { gg_pre_population: { rule } });
  }
}

/**
 * Expand one `@Validation.totals` into a calculation per money field of the block.
 *
 * Two shapes of source, and the difference is visible in the type: a repeatable list, so
 * the block is found inside each entry and every entry contributes; or a peer property
 * holding the same block, so the two named columns contribute.
 */
function collectTotals(
  program: Program,
  target: ModelProperty,
  block: Block,
  at: string[],
  parent: string[],
  modelPath: Map<Model, string[]>,
  calculations: Calculation[],
): void {
  const sources = propTotals(program, target)!;
  const model = block.model as Model;

  for (const field of moneyFields(program, model)) {
    const refs: Reference[] = [];
    for (const source of sources) {
      const type = source.type;
      if (type.kind === "Model" && type.indexer) {
        const item = type.indexer.value;
        if (item.kind !== "Model") continue;
        const inner = sameBlock(program, item, block);
        if (!inner) continue;
        const base = [...(modelPath.get(source.model as Model) ?? []), source.name];
        refs.push({
          emit: `${base.join(".")}[*].${inner.name}.${field}`,
          resolve: [...base, inner.name, field].join("."),
        });
        continue;
      }
      // A peer holding the same block: its path is this target's parent plus its name.
      const base = [...(modelPath.get(source.model as Model) ?? parent), source.name];
      refs.push({
        emit: [...base, field].join("."),
        resolve: [...base, field].join("."),
      });
    }
    if (!refs.length) continue;
    calculations.push({ at: [...at, field], rule: "sum_monetary", refs });
  }
}

/** The money-valued fields of a block, in declaration order. */
function moneyFields(program: Program, model: Model): string[] {
  const out: string[] = [];
  for (const prop of model.properties.values()) {
    const type = prop.type;
    // Money is semantic catalogue vocabulary, not the identity of one scalar. This lets
    // another source preserve a stricter wire precision while remaining a monetary value.
    if (hasTypeTag(program, type, "money")) {
      out.push(prop.name);
    }
  }
  return out;
}

/** The property of `item` that holds the same block as `block`. */
function sameBlock(program: Program, item: Model, block: Block): ModelProperty | undefined {
  const matches = [...item.properties.values()].filter((prop) => {
    const type = prop.type as Model | Scalar;
    return (type.kind === "Model" || type.kind === "Scalar") && type === block.model;
  });
  return matches.length === 1 ? matches[0] : undefined;
}
