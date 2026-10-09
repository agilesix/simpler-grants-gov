import {
  fromXmlPath,
  type Discrepancy,
  type Fields,
  type Requiredness,
  type Rules,
} from "../model.ts";

/** The parts of a form plan (`site/src/content/forms/<slug>.json`) the suite reads. */
export interface PlanField {
  label: string;
  dat_field?: string;
  required: boolean | string;
  help_text?: string;
  constraints?: string;
  json_path?: string;
  xml_path?: string;
  /** Overrides the section's `max_occurs`. */
  max_occurs?: MaxOccurs;
}

/** How many times a field can appear in one form. */
export type MaxOccurs = number | "unbounded";

export interface PlanSection {
  title: string;
  /** For a repeating section, how many entries it allows. Defaults to 1. */
  max_occurs?: MaxOccurs;
  fields: PlanField[];
}

export interface Plan {
  slug: string;
  spec_id?: string;
  xsd_url?: string;
  dat_url?: string;
  sections?: PlanSection[];
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
  const rules: Rules = {};
  for (const item of text.split(",").map((part) => part.trim())) {
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
  const all = (plan.sections ?? []).flatMap((section) =>
    section.fields.map((field) => ({
      ...field,
      max_occurs: field.max_occurs ?? section.max_occurs ?? 1,
    })),
  );
  all.forEach((field, order) => {
    const id = field[key];
    if (!id) return;
    const required = readRequired(field.required);
    if (required === undefined)
      problems.push({
        kind: "required unreadable",
        path: id,
        detail: String(field.required),
      });
    const rules = field.constraints ? readConstraints(field.constraints) : {};
    if (rules === undefined)
      problems.push({
        kind: "constraints unreadable",
        path: id,
        detail: field.constraints,
      });
    fields.set(key === "xml_path" ? fromXmlPath(id) : id, {
      order,
      label: field.label,
      help: field.help_text,
      required,
      rules: { ...rules, maxOccurs: field.max_occurs },
    });
  });
  return fields;
}
