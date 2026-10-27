import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

import validShort from "./fixtures/sf424-short-valid.json";
import { loadFormSpec, type FormSpec } from "./formSpec";
import { createAjv } from "./validation";

// Private pinned SGG fixture, independent of the public demonstration examples.
const example = () => structuredClone(validShort);
let spec: FormSpec;
let validate: ReturnType<ReturnType<typeof createAjv>["compile"]>;

beforeAll(async () => {
  spec = await loadFormSpec("sf424-short");
  validate = createAjv().compile(spec.schema);
});

describe("SF-424 Short capture contract", () => {
  it("retains the literal reviewed source certification in the emitted layout", () => {
    const source = readFileSync(
      new URL("./fixtures/sf424-short-certification.txt", import.meta.url),
      "utf8",
    ).trimEnd();
    const groups = (
      spec.uischema as {
        elements: { label?: string; options?: { description?: string } }[];
      }
    ).elements;
    const group = groups.find((g) => g.label === "Authorized Representative");
    expect(group?.options?.description).toBe(source);
  });

  it("admits the retained SGG seed and both unsigned public drafts", () => {
    expect(validate(example()), JSON.stringify(validate.errors)).toBe(true);
    const samples =
      (spec.schema as { examples?: Record<string, unknown>[] }).examples ?? [];
    expect(samples).toHaveLength(2);
    for (const sample of samples) {
      expect(validate(sample), JSON.stringify(validate.errors)).toBe(true);
      expect(sample).not.toHaveProperty("aor_signature");
      expect(sample).not.toHaveProperty(
        "authorized_representative_date_signed",
      );
      expect(sample).not.toHaveProperty("date_received");
      expect(sample.project_director).not.toEqual(sample.contact_person);
    }
  });

  it.each([0, 1, 3, 4])("checks the applicant-type boundary (%s)", (count) => {
    const data = example();
    data.applicant_type_code = [
      "A: State Government",
      "B: County Government",
      "C: City or Township Government",
      "D: Special District Government",
    ].slice(0, count);
    expect(validate(data)).toBe(count >= 1 && count <= 3);
  });

  it("rejects an unknown applicant code", () => {
    expect(
      validate({ ...example(), applicant_type_code: ["ZZ: Unknown"] }),
    ).toBe(false);
  });

  it("requires an Other detail only when X occurs anywhere in the list", () => {
    const data = example() as Record<string, unknown>;
    data.applicant_type_code = ["A: State Government", "X: Other (specify)"];
    delete data.applicant_type_other_specify;
    expect(validate(data)).toBe(false);
    data.applicant_type_other_specify = "Community research partnership";
    expect(validate(data)).toBe(true);
    data.applicant_type_code = ["A: State Government"];
    delete data.applicant_type_other_specify;
    expect(validate(data)).toBe(true);
  });

  it.each([true, false, undefined])(
    "keeps the contact role required independently of the copy checkbox (%s)",
    (same) => {
      const data = example() as Record<string, unknown>;
      if (same === undefined) delete data.same_as_project_director;
      else data.same_as_project_director = same;
      delete data.contact_person;
      expect(validate(data)).toBe(false);
    },
  );

  it.each(["project_director", "contact_person"] as const)(
    "requires title, email and phone in %s",
    (role) => {
      for (const key of ["title", "email", "phone_number"]) {
        const data = example();
        delete (data[role] as Record<string, unknown>)[key];
        expect(validate(data), role + "." + key).toBe(false);
      }
    },
  );

  it.each(["applicant", "project_director", "contact_person"] as const)(
    "requires US state and ZIP in %s, with a foreign-country alternative",
    (role) => {
      const data = example();
      const address = (
        role === "applicant" ? data.applicant : data[role].address
      ) as Record<string, unknown>;
      delete address.state;
      delete address.zip_code;
      expect(validate(data)).toBe(false);
      address.country = "CAN: CANADA";
      address.province = "Ontario";
      expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
    },
  );

  it("rejects malformed dates while leaving date-order policy explicit", () => {
    expect(validate({ ...example(), project_start_date: "2026-02-30" })).toBe(
      false,
    );
    expect(
      validate({
        ...example(),
        project_start_date: "2027-01-01",
        project_end_date: "2026-01-01",
      }),
    ).toBe(true);
  });

  it("keeps draft admission separate from unresolved certification/Other source policy", () => {
    expect(validate({ ...example(), application_certification: false })).toBe(
      true,
    );
    expect(
      validate({
        ...example(),
        applicant_type_code: ["X: Other (specify)"],
        applicant_type_other_specify: "",
      }),
    ).toBe(true);
  });

  it("retains source-owned output annotations without claiming population or signing", () => {
    const properties = (
      spec.schema as { properties: Record<string, { readOnly?: boolean }> }
    ).properties;
    for (const key of [
      "agency_name",
      "assistance_listing_number",
      "assistance_listing_program_title",
      "funding_opportunity_number",
      "funding_opportunity_title",
      "sam_uei",
      "date_received",
      "aor_signature",
      "authorized_representative_date_signed",
    ]) {
      expect(properties[key].readOnly, key).toBe(true);
    }
  });
});
