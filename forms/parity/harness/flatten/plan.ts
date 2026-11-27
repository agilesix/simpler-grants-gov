import {
  fromXmlPath,
  type Discrepancy,
  type Fields,
  type Requiredness,
  type Rules,
} from "../model.ts";

/** How many entries a repeating node allows. */
export type MaxItems = number | "unbounded";

/** What every node of a form plan (`site/src/content/forms/<slug>.json`) can state. */
interface PlanNodeBase {
  label: string;
  help_text?: string;
  dat_field?: string;
  json_path?: string;
  xml_path?: string;
  /** For a repeating node, how many entries it allows. Unset means exactly one. */
  min_items?: number;
  max_items?: MaxItems;
}

/** One source element or DAT row that holds one entry of a list field. */
export interface SourceBinding {
  kind: "slot";
  /** The DAT `Field #` or the XSD element path. */
  path: string;
  /** Which entry of the list it holds, from 0. */
  index: number;
}

/** The parts of a plan field the suite reads. */
export interface PlanField extends PlanNodeBase {
  /** Stable plan identity for review links; independent of JSON/XML paths and position. */
  id?: string;
  kind: "field";
  required: boolean | string;
  constraints?: string;
  /** Who fills the field on submission, when the applicant doesn't. */
  post_populated?: string;
  /** For a list the source splits into one row or element per entry, where each entry goes. */
  source_bindings?: { dat?: SourceBinding[]; xml?: SourceBinding[] };
}

export interface PlanSection<
  F extends PlanField = PlanField,
> extends PlanNodeBase {
  kind: "section";
  children: PlanNode<F>[];
}

export type PlanNode<F extends PlanField = PlanField> = F | PlanSection<F>;

export interface Plan<F extends PlanField = PlanField> {
  slug: string;
  spec_id?: string;
  omb_number?: string;
  /** `MM/DD/YYYY`, as Grants.gov's form listing writes it. */
  expiration_date?: string;
  xsd_url?: string;
  dat_url?: string;
  children?: PlanNode<F>[];
}

/**
 * Every field under `nodes`, depth first in plan order, with how many times it can occur: its
 * own `max_items`, else its nearest repeating ancestor's, else 1. `entryItems` leaves out the
 * field's own `max_items`: how many times one entry of a list field can occur.
 */
export function walkFields<F extends PlanField>(
  nodes: PlanNode<F>[] = [],
  inherited: MaxItems = 1,
): { field: F; maxItems: MaxItems; entryItems: MaxItems }[] {
  return nodes.flatMap((node) =>
    node.kind === "section"
      ? walkFields(node.children, node.max_items ?? inherited)
      : [
          {
            field: node,
            maxItems: node.max_items ?? inherited,
            entryItems: inherited,
          },
        ],
  );
}

/** A plan's `required`: a boolean, or text that starts with Yes, No or Conditional. */
export function readRequired(
  required: boolean | string,
): Requiredness | undefined {
  if (typeof required === "boolean") return required ? "yes" : "no";
  const word = /^\s*(yes|no|conditional)\b/i.exec(required)?.[1].toLowerCase();
  return word as Requiredness | undefined;
}

const NUMERIC = /^(minLength|maxLength|minimum|maximum)\s+(-?\d+(?:\.\d+)?)$/;

/**
 * A plan's `constraints`, e.g. `minLength 1, maxLength 10` or `StateCodeDataType enumeration`.
 * Returns undefined for anything it cannot read, rather than guessing.
 */
export function readConstraints(text: string): Rules | undefined {
  const choices = /^enum\s+(\[.*\])$/i.exec(text.trim());
  if (choices) {
    try {
      const values: unknown = JSON.parse(choices[1]);
      return Array.isArray(values) &&
        values.length > 0 &&
        values.every((value) => typeof value === "string")
        ? { enum: values }
        : undefined;
    } catch {
      return undefined;
    }
  }
  const rules: Rules = {};
  // Read a trailing pattern whole, since a pattern like `\d{1,12}` contains a comma.
  const pattern = /(?:^|,)\s*pattern\s+(\S+)\s*$/.exec(text);
  if (pattern) rules.pattern = pattern[1];
  const rest = pattern ? text.slice(0, pattern.index) : text;
  if (pattern && !rest.trim()) return rules;
  for (const item of rest.split(",").map((part) => part.trim())) {
    let match: RegExpExecArray | null;
    if ((match = NUMERIC.exec(item))) {
      rules[match[1] as "minLength"] = Number(match[2]);
    } else if ((match = /^format\s+(\S+)$/.exec(item))) {
      rules.format = match[1];
    } else if ((match = /^pattern\s+(\S+)$/.exec(item))) {
      rules.pattern = match[1];
    } else if ((match = /^(\w+DataType\w*)(?:\s+enumeration)?$/.exec(item))) {
      rules.enumType = match[1];
    } else {
      return undefined;
    }
  }
  return rules;
}

/** Which plan attribute identifies a field in the artifact being compared. */
export type PlanKey = "json_path" | "xml_path" | "dat_field";

/**
 * A plan's fields keyed by one identifier. A field without that identifier is left out, and
 * text the plan states but the suite cannot read is added to `problems`.
 */
export function planFields(
  plan: Plan,
  key: PlanKey,
  problems: Discrepancy[] = [],
): Fields {
  const fields: Fields = new Map();
  const at = (path: string) => (key === "xml_path" ? fromXmlPath(path) : path);
  walkFields(plan.children).forEach(
    ({ field, maxItems, entryItems }, order) => {
      const id = field[key];
      const bindings =
        key === "json_path"
          ? undefined
          : field.source_bindings?.[key === "dat_field" ? "dat" : "xml"];
      if (!id && !bindings?.length) return;
      const required = readRequired(field.required);
      if (required === undefined)
        problems.push({
          kind: "required unreadable",
          path: id ?? field.label,
          detail: String(field.required),
        });
      const rules = field.constraints ? readConstraints(field.constraints) : {};
      if (rules === undefined)
        problems.push({
          kind: "constraints unreadable",
          path: id ?? field.label,
          detail: field.constraints,
        });
      const common = {
        order,
        label: field.label,
        help: field.help_text,
        ...(field.post_populated && { postPopulated: true }),
      };
      if (id) {
        fields.set(at(id), {
          ...common,
          required,
          rules: { ...rules, maxOccurs: maxItems },
        });
        return;
      }
      // A list the source splits by entry: each row or element holds one entry. The first
      // `min_items` entries are required when the list is.
      for (const binding of bindings!)
        fields.set(at(binding.path), {
          ...common,
          required:
            required === "yes" && binding.index >= (field.min_items ?? 1)
              ? "no"
              : required,
          rules: { ...rules, maxOccurs: entryItems },
        });
    },
  );
  return fields;
}
