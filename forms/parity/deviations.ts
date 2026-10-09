/**
 * The recorded differences in `diffs/`, as the form library shows them on a form's page.
 *
 * Every row here is verified: `npm run test:parity` fails if the difference stops matching
 * what was recorded. This module only reads the records, so the site can import it without
 * the harness's disk access.
 */
import { DIFFS } from "./diffs/index.ts";
import type { Plan, PlanField } from "./harness/flatten/plan.ts";
import {
  CATEGORIES,
  fromXmlPath,
  type Category,
  type FormDiff,
  type Pinned,
  type Recorded,
  type Registers,
  type Value,
} from "./harness/model.ts";

export { CATEGORIES, type Category };

export interface Deviation {
  category: Category;
  /** e.g. "Plan vs DAT". */
  comparison: string;
  /** The plan's label for the field, or its path when the plan has no such field. */
  field: string;
  /** The field's key in this comparison: a `json_path`, XSD element path or DAT field number. */
  path: string;
  /** What differs, in a sentence. */
  difference: string;
  reason: string;
}

type Pair = Exclude<keyof FormDiff, "slug">;

/** How each comparison is named, the other artifact's name, and the plan key it uses. */
const PAIRS: Record<
  Pair,
  {
    comparison: string;
    source: string;
    key: (field: PlanField) => string | undefined;
  }
> = {
  dat: { comparison: "Plan vs DAT", source: "DAT", key: (f) => f.dat_field },
  xsd: {
    comparison: "Plan vs XSD",
    source: "XSD",
    key: (f) => f.xml_path && fromXmlPath(f.xml_path),
  },
  jsonSchema: {
    comparison: "Plan vs JSON schema",
    source: "JSON schema",
    key: (f) => f.json_path,
  },
  uiSchema: {
    comparison: "Plan vs UI schema",
    source: "UI schema",
    key: (f) => f.json_path,
  },
  jsonSchemaVsXsd: {
    comparison: "JSON schema vs XSD",
    source: "XSD",
    key: (f) => f.json_path,
  },
};

const show = (value: Value) =>
  value === null
    ? "nothing"
    : Array.isArray(value)
      ? value.join(", ")
      : typeof value === "string"
        ? `“${value}”`
        : String(value);

const RULE_NAMES: Record<string, string> = {
  required: "Required",
  maxOccurs: "Maximum occurrences",
  minLength: "Minimum length",
  maxLength: "Maximum length",
  enumType: "Code list",
};

/** `a/b/maxLength` -> [`a/b`, `maxLength`]: the keyword is always the last segment. */
const splitRule = (key: string) => {
  const at = key.lastIndexOf("/");
  return [key.slice(0, at), key.slice(at + 1)];
};

/** Every recorded difference for the form with this plan, most significant category first. */
export function deviationsFor(plan: Plan): Deviation[] {
  const diff = DIFFS.find((d) => d.slug === plan.slug);
  if (!diff) return [];
  const fields = (plan.sections ?? []).flatMap((section) => section.fields);
  const rows: Deviation[] = [];

  for (const pair of Object.keys(PAIRS) as Pair[]) {
    const registers: Registers = diff[pair] ?? {};
    const { comparison, source, key } = PAIRS[pair];
    const labels = new Map(
      fields.flatMap((f) => {
        const k = key(f);
        return k ? [[k, f.label] as const] : [];
      }),
    );
    const add = (path: string, entry: Recorded, difference: string) =>
      rows.push({
        category: entry.category,
        comparison,
        field: labels.get(path) ?? path,
        path,
        difference,
        reason: entry.reason,
      });
    const pinned = (what: string, entry: Pinned) =>
      `${what}: plan ${show(entry.plan)}, ${source} ${show(entry.source)}`;

    for (const [path, entry] of Object.entries(
      registers.absentFromSource ?? {},
    ))
      add(path, entry, `In the plan but not the ${source}`);
    for (const [path, entry] of Object.entries(registers.absentFromPlan ?? {}))
      add(path, entry, `In the ${source} but not the plan`);
    for (const [path, entry] of Object.entries(registers.renamed ?? {}))
      add(path, entry, `The ${source} puts it at ${entry.to}`);
    for (const [key, entry] of Object.entries(registers.differingRules ?? {})) {
      const [path, rule] = splitRule(key);
      add(path, entry, pinned(RULE_NAMES[rule] ?? rule, entry));
    }
    for (const [path, entry] of Object.entries(registers.differingLabels ?? {}))
      add(path, entry, pinned("Label", entry));
    for (const [path, entry] of Object.entries(registers.differingHelp ?? {}))
      add(path, entry, pinned("Help text", entry));
    for (const [path, entry] of Object.entries(registers.outOfOrder ?? {}))
      add(path, entry, `In a different position than in the ${source}`);
  }

  const rank = Object.keys(CATEGORIES);
  return rows.sort(
    (a, b) => rank.indexOf(a.category) - rank.indexOf(b.category),
  );
}
