import { beforeAll, describe, expect, it } from "vitest";

import validSite from "./fixtures/performance-sites-valid.json";
import { loadFormSpec, type FormSpec } from "./formSpec";
import { createAjv } from "./validation";

// Private seed copied from the pinned full_valid_us SGG fixture referenced by the plan.
// Public demonstration edits must not silently change the negative-control inputs.
const example = () => structuredClone(validSite);
let spec: FormSpec;
let validate: ReturnType<ReturnType<typeof createAjv>["compile"]>;

beforeAll(async () => {
  spec = await loadFormSpec("performance-sites");
  validate = createAjv().compile(spec.schema);
});

describe("Performance Sites capture contract", () => {
  it("admits the retained SGG fixture and every public demonstration", () => {
    expect(validate(example()), JSON.stringify(validate.errors)).toBe(true);
    const samples = (spec.schema as { examples?: unknown[] }).examples ?? [];
    expect(samples).toHaveLength(3);
    for (const sample of samples) {
      expect(validate(sample), JSON.stringify(validate.errors)).toBe(true);
      expect(JSON.stringify(sample)).not.toMatch(/DISTINCT|SENTINEL/);
    }
  });

  it.each([false, undefined, true])(
    "requires a primary organization unless individual is explicitly true (%s)",
    (individual) => {
      const data = example();
      const site = data.primary_site as Record<string, unknown>;
      delete site.organization_name;
      if (individual === undefined) delete site.submitting_as_individual;
      else site.submitting_as_individual = individual;
      expect(validate(data)).toBe(individual === true);
    },
  );

  it.each(["state", "zip_code", "congressional_district"])(
    "requires the US %s answer",
    (field) => {
      const data = example();
      if (field === "congressional_district") {
        delete (data.primary_site as Record<string, unknown>)[field];
      } else {
        delete (data.primary_site.address as Record<string, unknown>)[field];
      }
      expect(validate(data)).toBe(false);
    },
  );

  it("does not require US-only answers for a non-US site", () => {
    const data = example();
    const site = data.primary_site as Record<string, unknown>;
    const address = site.address as Record<string, unknown>;
    address.country = "CAN: CANADA";
    delete address.state;
    delete address.zip_code;
    delete site.congressional_district;
    expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
  });

  it("does not apply primary-organization requiredness to additional sites", () => {
    const data = example();
    delete (data.additional_sites[0] as Record<string, unknown>)
      .organization_name;
    expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
  });

  it.each([299, 300])(
    "checks the source's additional-site boundary (%s)",
    (count) => {
      const data = example();
      data.additional_sites = Array.from({ length: count }, () =>
        structuredClone(data.additional_sites[0]),
      );
      expect(validate(data)).toBe(count === 299);
    },
  );

  it("rejects an invalid attachment reference without pretending a UUID is an upload", () => {
    expect(
      validate({ ...example(), additional_locations_attachment: "not-an-id" }),
    ).toBe(false);
    expect(
      validate({
        ...example(),
        additional_locations_attachment: "3a6d2969-d9c7-45ea-a143-570ddff3f3a5",
      }),
    ).toBe(true);
  });

  it("keeps source-policy and wire decisions distinct from draft admission", () => {
    const data = example();
    data.primary_site.address.zip_code = "12345";
    (data.primary_site.address as Record<string, unknown>).province =
      "Retained draft answer";
    // Current SGG-compatible capture admits these. DAT nine-digit guidance and
    // exclusive State/Province XML output remain explicit review/integration work.
    expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
  });
});
