import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { FORMS_ROOT } from "../parity/harness/load.ts";
import { loadFormValidator } from "./harness.ts";

const AD = "usda-ad-3030";
const examples = (slug: string) =>
  JSON.parse(
    readFileSync(
      path.join(FORMS_ROOT, "dist/canonical/forms", slug, "schema.json"),
      "utf8",
    ),
  ).examples as Record<string, unknown>[];
const clone = <T>(value: T): T => structuredClone(value);

describe("AD-3030 representations", () => {
  it("accepts both examples without turning instruction groups into answers", async () => {
    const { validate } = await loadFormValidator(AD);
    expect(examples(AD)).toHaveLength(2);
    for (const value of examples(AD)) {
      expect(validate(value), JSON.stringify(validate.errors)).toBe(true);
      expect(Object.keys(value).sort()).toEqual(["applicant", "certification"]);
      expect(Object.keys(value.applicant as object).sort()).toEqual([
        "address",
        "felony_conviction",
        "name",
        "tax_id_number",
        "unpaid_federal_tax",
      ]);
      expect(Object.keys(value.certification as object).sort()).toEqual([
        "date_signed",
        "signature",
        "title",
      ]);
    }
  });
  it.each([
    "name",
    "address",
    "tax_id_number",
    "felony_conviction",
    "unpaid_federal_tax",
  ])("requires applicant answer %s", async (field) => {
    const { validate } = await loadFormValidator(AD);
    const value = clone(examples(AD)[0]);
    delete (value.applicant as Record<string, unknown>)[field];
    expect(validate(value)).toBe(false);
  });
  it.each(["signature", "title", "date_signed"])(
    "retains required completion value %s",
    async (field) => {
      const { validate } = await loadFormValidator(AD);
      const value = clone(examples(AD)[0]);
      delete (value.certification as Record<string, unknown>)[field];
      expect(validate(value)).toBe(false);
    },
  );
  it.each([
    ["name", 140],
    ["address", 300],
  ] as const)(
    "keeps %s's whole-text source boundary instead of imposing a different bank question",
    async (field, max) => {
      const { validate } = await loadFormValidator(AD);
      const value = clone(examples(AD)[0]);
      const applicant = value.applicant as Record<string, unknown>;
      applicant[field] = "A".repeat(max);
      expect(validate(value)).toBe(true);
      applicant[field] = "A".repeat(max + 1);
      expect(validate(value)).toBe(false);
    },
  );
  it("preserves leading zeros and requires exactly four digits, as the DAT specifies", async () => {
    const { validate } = await loadFormValidator(AD);
    const value = clone(examples(AD)[0]);
    const applicant = value.applicant as Record<string, unknown>;
    applicant.tax_id_number = "0012";
    expect(validate(value)).toBe(true);
    for (const invalid of [12, "012", "00012", "AB12"]) {
      applicant.tax_id_number = invalid;
      expect(validate(value)).toBe(false);
    }
  });
  it.each(["felony_conviction", "unpaid_federal_tax"])(
    "preserves distinct %s answers and the full source encoding",
    async (field) => {
      const { validate } = await loadFormValidator(AD);
      const value = clone(examples(AD)[0]);
      const applicant = value.applicant as Record<string, unknown>;
      for (const source of ["Y: Yes", "N: No"]) {
        applicant[field] = source;
        expect(validate(value)).toBe(true);
      }
      for (const invalid of [true, false, "Y", "N", "Yes", ""]) {
        applicant[field] = invalid;
        expect(validate(value)).toBe(false);
      }
    },
  );
  it("rejects impossible dates and overlong signature/title values", async () => {
    const { validate } = await loadFormValidator(AD);
    for (const [field, invalid] of [
      ["date_signed", "2026-02-30"],
      ["signature", "A".repeat(145)],
      ["title", "A".repeat(46)],
    ]) {
      const value = clone(examples(AD)[0]);
      (value.certification as Record<string, unknown>)[field] = invalid;
      expect(validate(value)).toBe(false);
    }
  });
});
