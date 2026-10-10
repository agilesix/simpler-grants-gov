/**
 * Pure helpers for the field comparison on a form's page: which fields a filter shows, what
 * each field differs in, and how the sheet words it. The stores in `stores/fieldComparison.ts`
 * hold the state; these only compute from it.
 */
import type { FieldData } from "@/content.config";
import type {
  Attribute,
  AttributeRow,
  Cell,
  FieldComparison as ParityField,
  FormComparison as ParityForm,
  Source,
  Status,
} from "@parity/comparison.ts";

export type { Attribute, AttributeRow, Cell, Source, Status };
export type FieldComparison = ParityField<FieldData>;
export type FormComparison = ParityForm<FieldData>;

/** A recorded difference's category. */
export type DiffType = "gap" | "upstream" | "intentional";
/** What a filter tile selects: fields with a category of difference, or fields with none. */
export type FilterKey = DiffType | "matches";

export const DIFF_TYPES: readonly DiffType[] = [
  "gap",
  "upstream",
  "intentional",
];
export const FILTER_KEYS: readonly FilterKey[] = [...DIFF_TYPES, "matches"];
export const SOURCES: readonly Source[] = ["dat", "xsd", "form"];

export const SOURCE_LABELS: Record<Source, string> = {
  dat: "DAT",
  xsd: "XSD",
  form: "Form",
};

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  matchedBy: "Matched by",
  label: "Label",
  help: "Help",
  required: "Required",
  length: "Length",
  format: "Format",
  range: "Range",
  options: "Options",
  position: "Position",
};

export const STATUS: Record<
  Status,
  { label: string; symbol: string; description: string }
> = {
  match: {
    label: "Match",
    symbol: "✓",
    description: "Matches every source it is compared with.",
  },
  intentional: {
    label: "Intentional",
    symbol: "I",
    description: "Simpler Grants intentionally differs from Grants.gov.",
  },
  upstream: {
    label: "Upstream",
    symbol: "U",
    description: "The Grants.gov DAT and XSD disagree.",
  },
  gap: {
    label: "Gap",
    symbol: "G",
    description: "A known gap awaiting a fix.",
  },
  notCompared: {
    label: "Not compared",
    symbol: "–",
    description: "Not compared.",
  },
  unrecorded: {
    label: "Unrecorded difference",
    symbol: "!",
    description:
      "A difference no record accepts. The parity tests fail until it is recorded.",
  },
};

/** One cell of a field's matrix. */
export interface CellRef {
  attribute: Attribute;
  source: Source;
}

/** A cell that differs from the plan, with its row. */
export interface Difference extends CellRef {
  row: AttributeRow;
  cell: Cell;
}

const DIFFERS = new Set<Status>([...DIFF_TYPES, "unrecorded"]);

export const isDiffType = (status: Status): status is DiffType =>
  (DIFF_TYPES as readonly Status[]).includes(status);

/** Every cell that differs from the plan, row by row. */
export function differences(field: FieldComparison): Difference[] {
  return field.rows.flatMap((row) =>
    SOURCES.filter((source) => DIFFERS.has(row.cells[source].status)).map(
      (source) => ({
        attribute: row.attribute,
        source,
        row,
        cell: row.cells[source],
      }),
    ),
  );
}

export const matchesEverySource = (field: FieldComparison) =>
  differences(field).length === 0;

/** Fields any selected filter selects; every field when none is selected. */
export function visibleFields(
  fields: readonly FieldComparison[],
  filter: readonly FilterKey[],
): FieldComparison[] {
  if (!filter.length) return [...fields];
  return fields.filter((field) =>
    filter.some((key) =>
      key === "matches" ? matchesEverySource(field) : field.counts[key] > 0,
    ),
  );
}

/** For each tile: how many differences (or matching fields), and in how many fields. */
export function categoryCounts(
  fields: readonly FieldComparison[],
): Record<FilterKey, { count: number; fields: number }> {
  const matching = fields.filter(matchesEverySource).length;
  const counts = { matches: { count: matching, fields: matching } } as Record<
    FilterKey,
    { count: number; fields: number }
  >;
  for (const type of DIFF_TYPES)
    counts[type] = {
      count: fields.reduce((sum, field) => sum + field.counts[type], 0),
      fields: fields.filter((field) => field.counts[type] > 0).length,
    };
  return counts;
}

/** The cell selected when a field opens: its first difference, if it has one. */
export function defaultCell(field: FieldComparison): CellRef | null {
  const [first] = differences(field);
  return first ? { attribute: first.attribute, source: first.source } : null;
}

/** The field's differences of the selected types; all of them when none is selected. */
export function visibleDifferences(
  field: FieldComparison,
  filter: readonly DiffType[],
): Difference[] {
  const all = differences(field);
  if (!filter.length) return all;
  return all.filter(
    ({ cell }) => !isDiffType(cell.status) || filter.includes(cell.status),
  );
}

/** How many of the field's differences fall in each category. */
export function diffTypeCounts(
  field: FieldComparison,
): Record<DiffType, number> {
  const counts: Record<DiffType, number> = {
    gap: 0,
    upstream: 0,
    intentional: 0,
  };
  for (const { cell } of differences(field))
    if (isDiffType(cell.status)) counts[cell.status] += 1;
  return counts;
}

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

const listed = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/** One line under the sheet's title: what the field differs from, and why that is safe. */
export function summarize(field: FieldComparison): string {
  const all = differences(field);
  if (!all.length) return "Matches every source it is compared with.";
  const sources = SOURCES.filter((source) =>
    all.some((d) => d.source === source),
  );
  const names = sources.map((source) => `the ${SOURCE_LABELS[source]}`);
  const counts = diffTypeCounts(field);
  const kinds = DIFF_TYPES.filter((type) => counts[type]).map(
    (type) => `${counts[type]} ${STATUS[type].label.toLowerCase()}`,
  );
  const unrecorded = all.filter((d) => d.cell.status === "unrecorded").length;
  if (unrecorded) kinds.push(`${unrecorded} unrecorded`);
  const verdict = unrecorded
    ? `${plural(unrecorded, "difference is", "differences are")} not recorded, so the parity tests fail.`
    : "Every difference is recorded and checked by the parity tests.";
  return `Differs from ${listed(names)} in ${plural(all.length, "place")}: ${kinds.join(", ")}. ${verdict}`;
}

/** How the field tree words a plan field's requiredness, as `FieldRow.astro` does. */
export function requiredLabel(field: FieldData): string | undefined {
  if (field.required === true) return "* Required";
  if (typeof field.required === "string" && field.required !== "false")
    return field.required;
  return undefined;
}
