/**
 * The harness's entry point: `checkForm` runs every comparison for one form.
 *
 *   load.ts      reads plans, compiled artifacts and cached Grants.gov sources from disk
 *   flatten/     turns each artifact into `Fields`, a map of path -> field (no disk access)
 *   compare.ts   compares two `Fields` maps and applies a form's recorded differences
 *   model.ts     the vocabulary all three share
 */
import {
  comparePair,
  type Pair,
  type PairResult,
  type PairSpec,
} from "./compare.ts";
import { datFields } from "./flatten/dat.ts";
import { indexLeaves, jsonSchemaFields } from "./flatten/jsonSchema.ts";
import { planFields, type Plan } from "./flatten/plan.ts";
import { uiSchemaFields } from "./flatten/uiSchema.ts";
import { xsdFields } from "./flatten/xsd.ts";
import {
  loadFormSchema,
  loadIndex,
  loadPlans,
  loadUiSchema,
  readSource,
} from "./load.ts";
import {
  fromXmlPath,
  type Discrepancy,
  type Fields,
  type FormDiff,
} from "./model.ts";

/**
 * What each comparison checks, as the tests name it. The DAT is compared on `maxLength`
 * only (see `datFields`); `enum` is compared only between the two artifacts that list values.
 * JSON schema vs XSD compares only fields the plan links, and lets the schema be stricter.
 * Labels compared with the DAT carry the asterisk it prints on a required field (see
 * `withAsterisk`).
 */
export const SPECS = {
  dat: {
    subject: "plan",
    order: true,
    labels: true,
    help: true,
    constraints: { keywords: ["maxLength"], mode: "equal" },
    occurrences: "equal",
  },
  xsd: {
    subject: "plan",
    constraints: {
      keywords: [
        "minLength",
        "maxLength",
        "pattern",
        "minimum",
        "maximum",
        "enumType",
      ],
      mode: "equal",
    },
    occurrences: "equal",
  },
  jsonSchema: {
    subject: "source",
    constraints: {
      keywords: [
        "minLength",
        "maxLength",
        "pattern",
        "format",
        "minimum",
        "maximum",
      ],
      mode: "equal",
    },
    occurrences: "equal",
  },
  uiSchema: { subject: "source", order: true, labels: true, help: true },
  jsonSchemaVsXsd: {
    subject: "plan",
    fields: false,
    constraints: {
      keywords: [
        "minLength",
        "maxLength",
        "pattern",
        "minimum",
        "maximum",
        "enum",
      ],
      mode: "contains",
    },
    occurrences: "contains",
  },
} satisfies Record<string, PairSpec>;

/** Every comparison for one form, grouped as the tests report them. */
export interface FormCheck {
  requirements: { dat: PairResult; xsd: PairResult };
  /** Absent for a plan without a `spec_id`: there is nothing compiled to check. */
  implementation?: { jsonSchema: PairResult; uiSchema: PairResult };
  xml?: { jsonSchemaVsXsd: PairResult };
  suite: {
    /** Plan text the suite could not read. */
    planProblems: Discrepancy[];
    /** Leaves of the compiled schema and its `index.json` that do not agree. */
    indexProblems: Discrepancy[];
    /** Recorded differences, from every comparison, that no longer exist. */
    stale: Discrepancy[];
  };
}

const pair = (
  registers: Pair["registers"] = {},
  plan: Fields,
  source: Fields,
): Pair => ({ registers, plan, source });

function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`missing ${what}`);
  return value;
}

/**
 * Each XSD field keyed by the compiled-schema path the plan says answers it, beside that
 * schema field, so the two can be compared directly. Fields the plan does not link are left
 * out; the plan-vs-schema and plan-vs-XSD comparisons already report them.
 */
function joinThroughPlan(
  diff: FormDiff,
  plan: Plan,
  schema: Fields,
  xsd: Fields,
) {
  const toSchema = diff.jsonSchema?.renamed ?? {};
  const toXsd = diff.xsd?.renamed ?? {};
  const left: Fields = new Map();
  const right: Fields = new Map();
  for (const field of (plan.sections ?? []).flatMap(
    (section) => section.fields,
  )) {
    if (!field.json_path || !field.xml_path) continue;
    const schemaPath = toSchema[field.json_path]?.to ?? field.json_path;
    const xmlPath = fromXmlPath(field.xml_path);
    const xsdField = xsd.get(toXsd[xmlPath]?.to ?? xmlPath);
    const schemaField = schema.get(schemaPath);
    if (!xsdField || !schemaField) continue;
    left.set(schemaPath, schemaField);
    right.set(schemaPath, xsdField);
  }
  return { left, right };
}

/** Leaves of the walked schema and of `index.json` that the other does not have. */
function indexDisagreements(
  schema: Fields,
  leaves: Set<string>,
): Discrepancy[] {
  return [
    ...[...leaves]
      .filter((path) => !schema.has(path))
      .map((path) => ({ kind: "index leaf missing from schema", path })),
    ...[...schema.keys()]
      .filter((path) => !leaves.has(path))
      .map((path) => ({ kind: "schema leaf missing from index", path })),
  ];
}

/**
 * The plan's labels as the DAT prints them: `* ` before every field the plan requires. Where
 * the asterisk and the plan's requiredness agree, the labels compare as plain text; where
 * they disagree, the label comparison reports it.
 */
const withAsterisk = (fields: Fields): Fields =>
  new Map(
    [...fields].map(([path, field]) => [
      path,
      field.required === "yes" && field.label
        ? { ...field, label: `* ${field.label}` }
        : field,
    ]),
  );

export async function checkForm(
  diff: FormDiff,
  plans: Map<string, Plan> = loadPlans(),
): Promise<FormCheck> {
  const plan = required(plans.get(diff.slug), `plan with slug ${diff.slug}`);
  const planProblems: Discrepancy[] = [];

  const datSource = datFields(
    readSource(required(plan.dat_url, `dat_url in plan ${diff.slug}`)),
  );
  const xsdSource = xsdFields(
    required(plan.xsd_url, `xsd_url in plan ${diff.slug}`),
    (url) => readSource(url).toString("utf8"),
  );
  const dat = comparePair(
    pair(
      diff.dat,
      withAsterisk(planFields(plan, "dat_field", planProblems)),
      datSource,
    ),
    SPECS.dat,
  );
  const xsd = comparePair(
    pair(diff.xsd, planFields(plan, "xml_path"), xsdSource),
    SPECS.xsd,
  );
  const requirements = { dat, xsd };
  if (!plan.spec_id)
    return {
      requirements,
      suite: {
        planProblems,
        indexProblems: [],
        stale: [...dat.stale, ...xsd.stale],
      },
    };

  const specId = plan.spec_id;
  const schemaSource = jsonSchemaFields(await loadFormSchema(specId));
  const uiSource = uiSchemaFields(loadUiSchema(specId), schemaSource);
  const jsonPlan = planFields(plan, "json_path");
  const joined = joinThroughPlan(diff, plan, schemaSource, xsdSource);
  const jsonSchema = comparePair(
    pair(diff.jsonSchema, jsonPlan, schemaSource),
    SPECS.jsonSchema,
  );
  const uiSchema = comparePair(
    pair(diff.uiSchema, jsonPlan, uiSource),
    SPECS.uiSchema,
  );
  const jsonSchemaVsXsd = comparePair(
    pair(diff.jsonSchemaVsXsd, joined.left, joined.right),
    SPECS.jsonSchemaVsXsd,
  );

  return {
    requirements,
    implementation: { jsonSchema, uiSchema },
    xml: { jsonSchemaVsXsd },
    suite: {
      planProblems,
      indexProblems: indexDisagreements(
        schemaSource,
        new Set(indexLeaves(loadIndex(specId))),
      ),
      stale: [dat, xsd, jsonSchema, uiSchema, jsonSchemaVsXsd].flatMap(
        (result) => result.stale,
      ),
    },
  };
}

export type { PairResult } from "./compare.ts";
export { loadPlans } from "./load.ts";
export { report, type Discrepancy, type FormDiff } from "./model.ts";
