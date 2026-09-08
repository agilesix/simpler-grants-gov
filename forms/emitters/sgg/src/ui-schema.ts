import type { Model, ModelProperty, Program } from "@typespec/compiler";
import { getDoc } from "@typespec/compiler";
import {
  type AtomicCondition, type Block, type Condition, childBlock, modelLabel, modelOrder,
  normalizedOverrideEnabledWhen, orderedProps, propEnabledWhen, propHelpText, propLabel,
  propOmit, propReadOnly, propReadOnlyWhen, propSection, propTotals, propVisibleWhen,
  propWidget, readBlock, typeTags,
} from "simpler-forms";
import { modelMultiFields, propSggFieldList } from "./model.js";

export interface SggField {
  type: "field" | "null";
  definition: string;
  widget?: string;
  /** Show the field's description in the print view as well as the form. */
  printDescription?: boolean;
  conditional?: Record<string, unknown>;
}
export interface SggFieldList {
  type: "fieldList";
  name: string;
  label: string;
  definition: string;
  description?: string;
  hideFieldListHeading?: boolean;
  validateBeforeAdd?: boolean;
  conditional?: Record<string, unknown>;
  children: (SggField | SggFieldList | SggMultiField)[];
}
export interface SggMultiField {
  type: "multiField";
  name: string;
  widget: string;
  definition: string[];
  children?: SggTableChildren;
}
export interface SggTableColumn {
  columnHeader: string;
  width?: number;
}
export type SggTableCell =
  | { type: "input" | "readOnly"; definition: string; format?: "dollar" }
  | { type: "select"; definition: string; options: (string | number)[] }
  | { type: "plainText"; staticContent: string };
export interface SggTableChildren {
  columns: SggTableColumn[];
  rows: { cells: SggTableCell[] }[];
}
export interface SggSection {
  type: "section";
  name: string;
  label: string;
  description?: string;
  children: (SggField | SggFieldList | SggMultiField)[];
}

interface AbsoluteAtomicCondition {
  scope: "root" | "item";
  sourcePath: string[];
  operator: "equals" | "in" | "countAtLeast" | "present";
  value?: string | number | boolean | null;
  values?: (string | number | boolean | null)[];
  minimum?: number;
}
interface AbsoluteAnyCondition {
  operator: "any";
  predicates: AbsoluteAtomicCondition[];
}
type AbsoluteCondition = AbsoluteAtomicCondition | AbsoluteAnyCondition;

function predicate(condition: AbsoluteCondition): Record<string, unknown> {
  if (condition.operator === "any") {
    return { op: "any", predicates: condition.predicates.map(predicate) };
  }
  const ref = {
    scope: condition.scope,
    pointer: `/${condition.sourcePath.join("/")}`,
  };
  if (condition.operator === "in") {
    return { op: "in", ref, values: condition.values ?? [] };
  }
  if (condition.operator === "countAtLeast") {
    return { op: "countAtLeast", ref, minimum: condition.minimum };
  }
  if (condition.operator === "present") return { op: "present", ref };
  return { op: "equals", ref, value: condition.value };
}

/**
 * SGG's UI vocabulary with the specification's own names.
 *
 * The structure here is SGG's -- flat sections, `fieldList`, `multiField`, `definition`
 * pointers -- because that is the target's vocabulary and it is derived from decorators only
 * this emitter can see. The *names* are the specification's, so every artifact this emitter
 * writes agrees with `schema.json`, and a pointer can be checked against it by reading.
 *
 * Spelling those names the way SGG spells them is the adapter's job, and it renames the
 * schema, these pointers, and the rule keys from one map. That is what stops the three from
 * drifting apart.
 */

/**
 * Every property of a model including those inherited through `extends`, in
 * `@UI.order` if the model declares one. `@UI.order` accepts inherited properties,
 * which is what lets a form-local extension interleave its own fields with the
 * question's.
 */
function allProperties(program: Program, model: Model): ModelProperty[] {
  const chain: Model[] = [];
  for (let m: Model | undefined = model; m; m = m.baseModel) chain.unshift(m);

  // Keyed by name, so a redeclaration replaces what it narrows rather than rendering
  // beside it. A form that makes an optional member required declares it again, and the
  // field must appear once.
  const byName = new Map<string, ModelProperty>();
  for (const m of chain) for (const prop of m.properties.values()) byName.set(prop.name, prop);
  const props = [...byName.values()];

  const order = modelOrder(program, model);
  if (!order) return props;
  const out = order.map((name) => byName.get(name)).filter(Boolean) as ModelProperty[];
  for (const prop of props) if (!out.includes(prop)) out.push(prop);
  return out;
}

/** One form's overrides on the questions it composes, keyed by data path. */
type Overrides = Record<string, Record<string, unknown>>;

const at = (overrides: Overrides, dataPath: string) => overrides[dataPath] ?? {};

function overrideEnabledWhen(
  override: Record<string, unknown>,
): AbsoluteAtomicCondition[] {
  const condition = normalizedOverrideEnabledWhen(override);
  if (!condition) return [];
  if (condition.operator === "in") {
    return [{
      scope: "root",
      sourcePath: condition.sourcePath,
      operator: "in",
      values: condition.values,
    }];
  }
  return [{
    scope: "root",
    sourcePath: condition.sourcePath,
    operator: "equals",
    value: condition.value,
  }];
}

/**
 * Flatten a subtree into SGG's max-depth-1 vocabulary. A target-specific projection
 * of the canonical tree, not a composition semantic.
 *
 * `dataPath` is the dotted path an override addresses, so a form can drop or relabel one
 * field of a question it composes without the question or any other form noticing.
 */
function walk(
  program: Program,
  model: Model,
  prefix: string,
  dataPath: string,
  into: (SggField | SggFieldList | SggMultiField)[],
  overrides: Overrides,
  inheritedVisible: AbsoluteCondition[] = [],
  inheritedEnabled: AbsoluteCondition[] = [],
  inheritedReadOnly: AbsoluteCondition[] = [],
  itemPath?: string[],
): void {
  for (const prop of allProperties(program, model)) {
    const here = dataPath ? `${dataPath}.${prop.name}` : prop.name;
    if (propOmit(program, prop) || at(overrides, here).omit === true) continue;

    const path = `${prefix}/properties/${prop.name}`;
    const list = fieldListAt(
      program,
      prop,
      path,
      here,
      overrides,
      inheritedVisible,
      inheritedEnabled,
      inheritedReadOnly,
      itemPath,
    );
    if (list) {
      into.push(list);
      continue;
    }
    const object = objectBehind(program, prop);
    if (object) {
      if (propWidget(program, prop) === "Table") {
        into.push({
          type: "multiField",
          name: prop.name,
          widget: "Table",
          definition: [path],
          children: tableChildren(program, [prop], path, here, overrides),
        });
        continue;
      }
      const override = at(overrides, here);
      walk(
        program,
        object,
        path,
        here,
        into,
        overrides,
        [...inheritedVisible, ...absoluteConditions(propVisibleWhen(program, prop), here, itemPath)],
        [
          ...inheritedEnabled,
          ...overrideEnabledWhen(override),
          ...absoluteConditions(propEnabledWhen(program, prop), here, itemPath),
        ],
        [...inheritedReadOnly, ...absoluteConditions(propReadOnlyWhen(program, prop), here, itemPath)],
        itemPath,
      );
      continue;
    }
    into.push(field(
      program,
      prop,
      path,
      at(overrides, here),
      inheritedVisible,
      inheritedEnabled,
      inheritedReadOnly,
      itemPath,
    ));
  }
}

function field(
  program: Program,
  prop: ModelProperty,
  definition: string,
  override: Record<string, unknown>,
  inheritedVisible: AbsoluteCondition[] = [],
  inheritedEnabled: AbsoluteCondition[] = [],
  inheritedReadOnly: AbsoluteCondition[] = [],
  itemPath?: string[],
): SggField {
  const f: SggField = {
    type: override.visibleReadOnly === true
      ? "field"
      : override.readOnly === true || propReadOnly(program, prop)
        ? "null"
        : "field",
    definition,
  };
  const widget = (override.widget as string | undefined) ?? propWidget(program, prop);
  if (widget) f.widget = widget;
  if (override.printDescription === true) f.printDescription = true;
  const targetPath = definition
    .split("/")
    .filter((step) => step && step !== "properties" && step !== "items");
  const visible = [
    ...inheritedVisible,
    ...absoluteConditions(propVisibleWhen(program, prop), targetPath.join("."), itemPath),
  ];
  const intrinsicEnabled = [
    ...inheritedEnabled,
    ...absoluteConditions(propEnabledWhen(program, prop), targetPath.join("."), itemPath),
  ];
  const readOnly = [
    ...inheritedReadOnly,
    ...absoluteConditions(propReadOnlyWhen(program, prop), targetPath.join("."), itemPath),
  ];
  const overrideEnabled = overrideEnabledWhen(override);
  if (
    overrideEnabled.length
    && (visible.length || intrinsicEnabled.length || readOnly.length)
  ) {
    throw new Error(
      `@UI.overrides enabledWhen collides with intrinsic UI behavior at ${targetPath.join(".")}`,
    );
  }
  if (visible.length) {
    const predicates = visible.map(predicate);
    f.conditional = {
      when: predicates.length === 1 ? predicates[0] : { op: "all", predicates },
      then: { visible: true },
      otherwise: { visible: false },
    };
  } else {
    const enabled = [...intrinsicEnabled, ...overrideEnabled];
    if (enabled.length) {
      const predicates = enabled.map(predicate);
      f.conditional = {
        when: predicates.length === 1 ? predicates[0] : { op: "all", predicates },
        then: { interaction: "enabled" },
        otherwise: { interaction: "disabled" },
      };
    } else {
      if (readOnly.length) {
        const predicates = readOnly.map(predicate);
        f.conditional = {
          when: predicates.length === 1 ? predicates[0] : { op: "all", predicates },
          then: { interaction: "readOnly" },
          otherwise: { interaction: "enabled" },
        };
      }
    }
  }
  return f;
}

function absoluteConditions(
  conditions: Condition[],
  targetPath: string,
  itemPath?: string[],
): AbsoluteCondition[] {
  const parent = targetPath.split(".").filter(Boolean).slice(0, -1);
  const absolute = (condition: AtomicCondition): AbsoluteAtomicCondition => {
    const absolutePath = [...parent, ...condition.sourcePath];
    const withinItem = itemPath && itemPath.every((step, index) => absolutePath[index] === step);
    return {
      scope: withinItem ? "item" : "root",
      sourcePath: withinItem ? absolutePath.slice(itemPath.length) : absolutePath,
      operator: condition.operator,
      ...(condition.operator === "in"
        ? { values: condition.values }
        : condition.operator === "countAtLeast"
          ? { minimum: condition.minimum }
          : condition.operator === "equals"
            ? { value: condition.value }
            : {}),
    };
  };
  return conditions.map((condition) => {
    if (condition.operator === "any") {
      return { operator: "any", predicates: condition.predicates.map(absolute) };
    }
    return absolute(condition);
  });
}

/**
 * The object a property holds, or nothing when the property is a leaf.
 *
 * A single-valued question is a leaf even though it is a block, and a form-local extension
 * is an object even though it is not -- so the test is the shape, not whether the type
 * happens to be published.
 */
function objectBehind(program: Program, prop: ModelProperty): Model | undefined {
  const type = prop.type;
  if (type.kind !== "Model" || type.indexer) return undefined;
  const block = childBlock(program, prop);
  if (block?.scalar) return undefined;
  return type;
}

/** A model's own `@UI.label`, whether or not it is a published block. */
function itemLabel(program: Program, item: Model): string | undefined {
  return modelLabel(program, item);
}

/** An array of objects becomes a repeatable fieldList (D8: inferred, not declared). */
function asFieldList(
  program: Program,
  prop: ModelProperty,
  overrides: Overrides,
): SggFieldList | undefined {
  return fieldListAt(
    program,
    prop,
    `/properties/${prop.name}`,
    prop.name,
    overrides,
  );
}

/** A repeatable object at any depth, including one nested inside another field list. */
function fieldListAt(
  program: Program,
  prop: ModelProperty,
  definition: string,
  dataPath: string,
  overrides: Overrides,
  inheritedVisible: AbsoluteCondition[] = [],
  inheritedEnabled: AbsoluteCondition[] = [],
  inheritedReadOnly: AbsoluteCondition[] = [],
  parentItemPath?: string[],
): SggFieldList | undefined {
  const t = prop.type;
  if (t.kind !== "Model" || !t.indexer) return undefined;
  const item = t.indexer.value;
  if (item.kind !== "Model") return undefined;

  const children: (SggField | SggFieldList | SggMultiField)[] = [];
  const itemPath = dataPath.split(".").filter(Boolean);
  walk(program, item, `${definition}/items`, dataPath, children, overrides, [], [], [], itemPath);
  // The list's label names one entry, so it comes from the item block; the property's
  // own label names the collection and stays on the schema as `title`.
  const list: SggFieldList = {
    type: "fieldList",
    name: prop.name,
    label: itemLabel(program, item) ?? propLabel(program, prop) ?? prop.name,
    definition,
    children,
  };
  const description = propHelpText(program, prop) ?? getDoc(program, prop);
  if (description) list.description = description;
  if (propSggFieldList(program, prop).hideFieldListHeading === true) {
    list.hideFieldListHeading = true;
  }
  if (propSggFieldList(program, prop).validateBeforeAdd === true) {
    list.validateBeforeAdd = true;
  }
  const targetPath = definition
    .split("/")
    .filter((step) => step && step !== "properties" && step !== "items");
  const visible = [
    ...inheritedVisible,
    ...absoluteConditions(propVisibleWhen(program, prop), targetPath.join("."), parentItemPath),
  ];
  if (visible.length) {
    const predicates = visible.map(predicate);
    list.conditional = {
      when: predicates.length === 1 ? predicates[0] : { op: "all", predicates },
      then: { visible: true },
      otherwise: { visible: false },
    };
  } else {
    const enabled = [
      ...inheritedEnabled,
      ...overrideEnabledWhen(at(overrides, dataPath)),
      ...absoluteConditions(propEnabledWhen(program, prop), targetPath.join("."), parentItemPath),
    ];
    if (enabled.length) {
      const predicates = enabled.map(predicate);
      list.conditional = {
        when: predicates.length === 1 ? predicates[0] : { op: "all", predicates },
        then: { interaction: "enabled" },
        otherwise: { interaction: "disabled" },
      };
    } else {
      const readOnly = [
        ...inheritedReadOnly,
        ...absoluteConditions(propReadOnlyWhen(program, prop), targetPath.join("."), parentItemPath),
      ];
      if (readOnly.length) {
        const predicates = readOnly.map(predicate);
        list.conditional = {
          when: predicates.length === 1 ? predicates[0] : { op: "all", predicates },
          then: { interaction: "readOnly" },
          otherwise: { interaction: "enabled" },
        };
      }
    }
  }
  return list;
}

/**
 * The properties one of SGG's section components reads.
 *
 * Its own section's properties, plus whatever those total. Sections B, C and E each render
 * a grid over the same repeatable list that the applicant edits in section A, and the
 * list is named nowhere in their declarations -- but each section's total says which
 * collection it totals, and that is the same fact. So the column source is read off
 * `@Validation.totals` rather than repeated per section.
 */
function gridProperties(program: Program, block: Block, members: ModelProperty[]): string[] {
  const names: string[] = [];
  const add = (name: string) => {
    if (!names.includes(name)) names.push(name);
  };
  for (const member of members) {
    for (const source of propTotals(program, member) ?? []) {
      if (source.model === block.model) add(source.name);
    }
  }
  for (const member of members) add(member.name);
  return names;
}

/**
 * Project a regular dimensional object grid into Simpler's declarative Table contract.
 *
 * Object-valued properties identify row dimensions until a scalar-valued leaf model supplies
 * columns. Labels and read-only state therefore stay attached to the same authored model that
 * supplies schema and calculation behavior. The projector rejects mixed or irregular shapes
 * instead of inventing missing cells or form-specific branches.
 */
function tableChildren(
  program: Program,
  members: ModelProperty[],
  definitionPrefix = "",
  dataPathPrefix = "",
  overrides: Overrides = {},
): SggTableChildren {
  if (members.length !== 1) {
    throw new Error(
      `Table multiField requires exactly one object property; received ${members.length}`,
    );
  }
  const root = objectBehind(program, members[0]);
  if (!root) {
    throw new Error(`Table multiField property ${members[0].name} must contain an object`);
  }

  if (!allProperties(program, root).length) {
    throw new Error(`Table multiField property ${members[0].name} has no rows`);
  }

  interface TableLeafRow {
    dimensionLabels: string[];
    path: ModelProperty[];
    columns: ModelProperty[];
    money: boolean;
  }
  const rows: TableLeafRow[] = [];
  const dimensionHeaders: string[] = [];

  const visit = (model: Model, path: ModelProperty[]): void => {
    const properties = allProperties(program, model);
    const objectProperties = properties.map((prop) => ({ prop, model: objectBehind(program, prop) }));
    const objects = objectProperties.filter(({ model: child }) => child);
    if (!objects.length) {
      if (!properties.length) {
        throw new Error(`Table row ${path.at(-1)?.name ?? members[0].name} has no columns`);
      }
      rows.push({
        dimensionLabels: path.map((step) =>
          propLabel(program, step)
          ?? (objectBehind(program, step) ? modelLabel(program, objectBehind(program, step)!) : undefined)
          ?? step.name
        ),
        path,
        columns: properties,
        money: (readBlock(program, model)?.tags ?? []).includes("money"),
      });
      return;
    }
    if (objects.length !== properties.length) {
      throw new Error(
        `Table dimension ${path.at(-1)?.name ?? members[0].name} mixes object rows and scalar columns`,
      );
    }
    const depth = path.length;
    const header = modelLabel(program, model) ?? `Field ${depth + 1}`;
    if (dimensionHeaders[depth] && dimensionHeaders[depth] !== header) {
      throw new Error(
        `Table dimension ${depth + 1} labels ${dimensionHeaders[depth]} and ${header} do not match`,
      );
    }
    dimensionHeaders[depth] = header;
    for (const { prop, model: child } of objects) visit(child!, [...path, prop]);
  };
  visit(root, []);

  const maxDepth = Math.max(...rows.map((row) => row.path.length));
  const firstColumns = rows[0].columns;
  const columnNames = firstColumns.map((column) => column.name);
  for (const row of rows.slice(1)) {
    const names = row.columns.map((column) => column.name);
    if (names.length !== columnNames.length || names.some((name, index) => name !== columnNames[index])) {
      throw new Error(
        `Table row ${row.path.at(-1)?.name ?? members[0].name} columns ${names.join(", ")} do not match ${columnNames.join(", ")}`,
      );
    }
  }

  const dimensionWidth = maxDepth > 0 ? 40 / maxDepth : 0;
  const valueWidth = (maxDepth > 0 ? 60 : 100) / firstColumns.length;
  return {
    columns: [
      ...Array.from({ length: maxDepth }, (_, index) => ({
        columnHeader: dimensionHeaders[index] ?? `Field ${index + 1}`,
        width: dimensionWidth,
      })),
      ...firstColumns.map((column) => ({
        columnHeader: propLabel(program, column) ?? column.name,
        width: valueWidth,
      })),
    ],
    rows: rows.map((row) => {
      const pathNames = row.path.map((step) => step.name);
      return {
        cells: [
          ...Array.from({ length: maxDepth }, (_, index) => ({
            type: "plainText" as const,
            staticContent: row.dimensionLabels[index] ?? "",
          })),
          ...row.columns.map((column) => {
            const dataPath = [dataPathPrefix, ...pathNames, column.name].filter(Boolean).join(".");
            const override = at(overrides, dataPath);
            const options = column.type.kind === "Enum"
              ? [...column.type.members.values()].map((member) => member.value ?? member.name)
              : undefined;
            const columnIsMoney = column.type.kind === "Scalar"
              && typeTags(program, column.type).includes("money");
            const definition = `${definitionPrefix}${pathNames.map((name) => `/properties/${name}`).join("")}/properties/${column.name}`;
            const format = row.money || columnIsMoney ? { format: "dollar" as const } : {};
            if (
              override.visibleReadOnly === true
              || override.readOnly === true
              || propReadOnly(program, column)
            ) return { type: "readOnly" as const, definition, ...format };
            if (options) return { type: "select" as const, definition, options };
            return { type: "input" as const, definition, ...format };
          }),
        ],
      };
    }),
  };
}

export function emitSggUi(program: Program, block: Block): SggSection[] {
  if (!block.sections || block.model.kind !== "Model") return [];

  const order: string[] = [];
  const bySection = new Map<string, (SggField | SggFieldList | SggMultiField)[]>();
  const meta = new Map<string, { label: string; description?: string }>();
  for (const m of block.sections.members.values()) {
    const name = m.name;
    order.push(name);
    bySection.set(name, []);
    meta.set(name, { label: String(m.value ?? m.name), description: getDoc(program, m) });
  }

  // Which properties land in each section, in order. This is the whole content of a
  // section, whether it is rendered as a field list or handed to one component.
  const props = new Map<string, ModelProperty[]>(order.map((name) => [name, []]));
  const overrides = block.overrides as Overrides;
  for (const prop of orderedProps(program, block)) {
    const declared = propSection(program, prop);
    const overridden = at(overrides, prop.name).section;
    const sectionName = typeof overridden === "string"
      ? overridden
      : declared?.name;
    if (!sectionName) continue;
    if (at(overrides, prop.name).omit === true) continue;
    props.get(sectionName)?.push(prop);
  }

  const widgets = new Map(
    modelMultiFields(program, block.model as Model).map((d) => [d.section, d.widget]),
  );

  for (const name of order) {
    const bucket = bySection.get(name)!;
    const members = props.get(name)!;

    // A section handed to one of SGG's components receives its properties and lays itself
    // out, so none of its fields are walked.
    const widget = widgets.get(name);
    if (widget) {
      if (!members.length) continue;
      const multiField: SggMultiField = {
        type: "multiField",
        name: widget,
        widget,
        definition: gridProperties(program, block, members).map((p) => `/properties/${p}`),
      };
      if (widget === "Table") multiField.children = tableChildren(program, members);
      bucket.push(multiField);
      continue;
    }

    for (const prop of members) {
      const list = asFieldList(program, prop, overrides);
      if (list) {
        bucket.push(list);
        continue;
      }
      const path = `/properties/${prop.name}`;
      const object = objectBehind(program, prop);
      if (object) {
        const flat: SggField[] = [];
        walk(
          program,
          object,
          path,
          prop.name,
          flat,
          overrides,
          absoluteConditions(propVisibleWhen(program, prop), prop.name),
          absoluteConditions(propEnabledWhen(program, prop), prop.name),
          absoluteConditions(propReadOnlyWhen(program, prop), prop.name),
        );
        bucket.push(...flat);
        continue;
      }
      bucket.push(field(program, prop, path, at(overrides, prop.name)));
    }
  }

  const out: SggSection[] = [];
  for (const name of order) {
    const children = bySection.get(name)!;
    const m = meta.get(name)!;
    if (!children.length && !m.description) continue;
    const section: SggSection = { type: "section", name, label: m.label, children };
    if (m.description) section.description = m.description;
    out.push(section);
  }
  return out;
}
