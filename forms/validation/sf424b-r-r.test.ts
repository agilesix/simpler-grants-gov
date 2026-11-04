import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { FORMS_ROOT } from "../parity/harness/load.ts";
import { loadFormValidator } from "./harness.ts";

const RR = "assurances-for-non-construction-programs-sf-424b-r-r";
const examples = (slug: string) =>
  JSON.parse(
    readFileSync(
      path.join(FORMS_ROOT, "dist/canonical/forms", slug, "schema.json"),
      "utf8",
    ),
  ).examples as Record<string, unknown>[];
const clone = <T>(value: T): T => structuredClone(value);

describe("SF-424B R&R completed context", () => {
  it("accepts both authored examples and exposes only the four completion values", async () => {
    const { validate } = await loadFormValidator(RR);
    expect(examples(RR)).toHaveLength(2);
    for (const example of examples(RR)) {
      expect(validate(example), JSON.stringify(validate.errors)).toBe(true);
      expect(Object.keys(example).sort()).toEqual([
        "applicant_organization_name",
        "authorized_representative",
        "submitted_date",
      ]);
      expect(
        Object.keys(example.authorized_representative as object).sort(),
      ).toEqual(["signature", "title"]);
    }
  });
  it.each(["signature", "title"])(
    "requires the DAT's representative %s despite the optional XSD element",
    async (field) => {
      const { validate } = await loadFormValidator(RR);
      const value = clone(examples(RR)[0]);
      delete (value.authorized_representative as Record<string, unknown>)[
        field
      ];
      expect(validate(value)).toBe(false);
    },
  );
  it.each(["applicant_organization_name", "submitted_date"])(
    "requires DAT completion value %s",
    async (field) => {
      const { validate } = await loadFormValidator(RR);
      const value = clone(examples(RR)[0]);
      delete value[field];
      expect(validate(value)).toBe(false);
    },
  );
  it.each([
    ["signature", 144],
    ["title", 45],
  ] as const)("enforces the source %s boundary", async (field, max) => {
    const { validate } = await loadFormValidator(RR);
    const value = clone(examples(RR)[0]);
    const rep = value.authorized_representative as Record<string, unknown>;
    rep[field] = "A".repeat(max);
    expect(validate(value)).toBe(true);
    rep[field] = "A".repeat(max + 1);
    expect(validate(value)).toBe(false);
  });
  it("preserves the source 60-character organization contract", async () => {
    const { validate } = await loadFormValidator(RR);
    const value = clone(examples(RR)[0]);
    value.applicant_organization_name = "A".repeat(60);
    expect(validate(value)).toBe(true);
    value.applicant_organization_name = "A".repeat(61);
    expect(validate(value)).toBe(false);
  });
});
