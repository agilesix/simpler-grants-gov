import { describe, expect, it } from "vitest";

import {
  categoryCounts,
  defaultCell,
  summarize,
  visibleDifferences,
  visibleFields,
  type Cell,
  type FieldComparison,
  type Status,
} from "./comparison";

const cell = (status: Status): Cell => ({ status, value: null });

/** A field whose label row has these statuses for the DAT, XSD and form. */
const field = (
  id: string,
  dat: Status,
  xsd: Status = "notCompared",
  form: Status = "match",
) => {
  const statuses = [dat, xsd, form];
  const counts = { gap: 0, upstream: 0, intentional: 0 };
  for (const status of statuses)
    if (status in counts) counts[status as keyof typeof counts] += 1;
  return {
    id,
    sectionIndex: 0,
    field: { label: id, required: false, type: "string" },
    rows: [
      {
        attribute: "matchedBy",
        plan: null,
        cells: { dat: cell("match"), xsd: cell("match"), form: cell("match") },
      },
      {
        attribute: "label",
        plan: id,
        cells: { dat: cell(dat), xsd: cell(xsd), form: cell(form) },
      },
    ],
    counts,
  } as FieldComparison;
};

const MATCHING = field("matching", "match");
const GAP = field("gap", "gap");
const MIXED = field("mixed", "upstream", "notCompared", "intentional");
const FIELDS = [MATCHING, GAP, MIXED];

describe("visibleFields", () => {
  it("shows every field without filter", () => {
    expect(visibleFields(FIELDS, [])).toEqual(FIELDS);
  });

  it("shows fields with any selected category", () => {
    expect(
      visibleFields(FIELDS, ["gap", "intentional"]).map((f) => f.id),
    ).toEqual(["gap", "mixed"]);
  });

  it("shows only matching fields for matches", () => {
    expect(visibleFields(FIELDS, ["matches"]).map((f) => f.id)).toEqual([
      "matching",
    ]);
  });
});

describe("categoryCounts", () => {
  it("counts differences and fields per category", () => {
    const counts = categoryCounts([...FIELDS, field("two gaps", "gap", "gap")]);
    expect(counts.gap).toEqual({ count: 3, fields: 2 });
    expect(counts.matches).toEqual({ count: 1, fields: 1 });
  });
});

describe("defaultCell", () => {
  it("selects first difference", () => {
    expect(defaultCell(MIXED)).toEqual({ attribute: "label", source: "dat" });
  });

  it("selects nothing for matching field", () => {
    expect(defaultCell(MATCHING)).toBeNull();
  });
});

describe("visibleDifferences", () => {
  it("lists only differing cells", () => {
    expect(visibleDifferences(MIXED, []).map((d) => d.source)).toEqual([
      "dat",
      "form",
    ]);
  });

  it("lists only selected types", () => {
    expect(
      visibleDifferences(MIXED, ["intentional"]).map((d) => d.source),
    ).toEqual(["form"]);
  });

  it("always lists unrecorded differences", () => {
    const broken = field("broken", "unrecorded");
    expect(visibleDifferences(broken, ["gap"])).toHaveLength(1);
  });
});

describe("summarize", () => {
  it("names sources and categories", () => {
    expect(summarize(MIXED)).toBe(
      "Differs from the DAT and the Form in 2 places: 1 upstream, 1 intentional. Every difference is recorded and checked by the parity tests.",
    );
  });

  it("says matching field matches", () => {
    expect(summarize(MATCHING)).toBe(
      "Matches every source it is compared with.",
    );
  });

  it("warns about unrecorded differences", () => {
    expect(summarize(field("broken", "unrecorded"))).toMatch(
      /1 difference is not recorded/,
    );
  });
});
