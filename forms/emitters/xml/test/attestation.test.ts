import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { EnumMember, Model, Program } from "@typespec/compiler";
import { createTester } from "@typespec/compiler/testing";
import { describe, expect, it } from "vitest";

import { generateXml } from "../src/runtime/index.js";
import { xmlMapping } from "../src/xml-mapping.js";

const FORMS_ROOT = fileURLToPath(new URL("../../..", import.meta.url));

const Tester = createTester(FORMS_ROOT, {
  libraries: ["simpler-forms", "@typespec/xml", "form-library-xml"],
});

const fixture = (name: string) =>
  readFile(fileURLToPath(new URL(`fixtures/${name}`, import.meta.url)), "utf8");

function lookup<T>(program: Program, reference: string): T {
  const [type] = program.resolveTypeReference(reference);
  if (!type) throw new Error(`no ${reference}`);
  return type as T;
}

// Attestation forms share one pattern: a long statement as a section's description, a few
// answers including a yes/no, and a signature and date the API fills in on submission.
// The other attestation forms rely on the XML mapping vs XSD parity checks.
describe("attestation pattern", () => {
  const mappingOf = async () => {
    const [{ program }] = await Tester.compileAndDiagnose(
      await fixture("attestation.tsp"),
    );
    expect(program.diagnostics.filter((d) => d.severity === "error")).toEqual(
      [],
    );
    return xmlMapping(
      program,
      lookup<Model>(program, "Forms.Attestation.Attestation"),
      lookup<EnumMember>(program, "Mappings.Target.grantsGovXml"),
      "snake",
    );
  };

  it("maps the answers, signature and date shaped like the XML", async () => {
    expect(await mappingOf()).toEqual(
      JSON.parse(await fixture("attestation.xml-mapping.json")),
    );
  });

  it("writes the yes/no answer as Y: Yes or N: No, and the populated signature and date", async () => {
    const mapping = await mappingOf();
    const xml = generateXml(mapping!, {
      organization_name: "Harbor Research Institute",
      convicted_of_felony: false,
      signature: "Morgan Lake",
      submitted_date: "2027-03-15",
    });
    expect(xml).toEqual(await fixture("attestation.xml"));
  });
});
