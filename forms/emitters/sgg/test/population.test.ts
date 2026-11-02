import { compile, NodeHost } from "@typespec/compiler";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ruleSchema } from "../src/model.js";

const MAIN = fileURLToPath(new URL("../../../specs/main.tsp", import.meta.url));
const programWith = async (source: string) => {
  const dir = await mkdtemp(path.join(tmpdir(), "sgg-population-"));
  const entry = path.join(dir, "main.tsp");
  await writeFile(entry, `import "${MAIN}";\nusing SimplerForms;\n${source}\n`);
  return compile(NodeHost, entry, { noEmit: true });
};

const modelSource = `
namespace PopulationTest;
@Meta.form(#{ id: "population-test", formName: "Population Test" })
model Example {
  @Sgg.prePopulate(Sgg.PrePopulationRule.agencyName)
  agencyName: string;
  nested: {
    @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
    signedDate?: plainDate;
  };
  entries: Entry[];
}
model Entry {
  startDate: plainDate;
  @Validation.notBefore(Entry.startDate)
  endDate: plainDate;
}
`;

describe("API rule declarations", () => {
  it("preserves nested/repeated paths and the emitted property's casing", async () => {
    const p = await programWith(modelSource);
    expect(p.diagnostics).toEqual([]);
    const example = p
      .getGlobalNamespaceType()
      .namespaces.get("PopulationTest")!
      .models.get("Example")!;
    expect(ruleSchema(p, example, "snake")).toEqual({
      agency_name: { gg_pre_population: { rule: "agency_name" } },
      nested: { signed_date: { gg_post_population: { rule: "current_date" } } },
      entries: {
        gg_type: "array",
        end_date: {
          gg_validation: {
            rule: "date_not_before",
            source_field: "start_date",
          },
        },
      },
    });
    expect(ruleSchema(p, example, "preserve")).toEqual({
      agencyName: { gg_pre_population: { rule: "agency_name" } },
      nested: { signedDate: { gg_post_population: { rule: "current_date" } } },
      entries: {
        gg_type: "array",
        endDate: {
          gg_validation: { rule: "date_not_before", source_field: "startDate" },
        },
      },
    });
  });

  it("rejects an answer with contradictory population phases", async () => {
    const p = await programWith(`
      model Conflicting {
        @Sgg.prePopulate(Sgg.PrePopulationRule.agencyName)
        @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
        answer: string;
      }
    `);
    expect(p.diagnostics.map((d) => d.code)).toContain(
      "simpler-forms-sgg/conflicting-population",
    );
  });

  it("rejects undeclared provider names instead of silently emitting an ignored rule", async () => {
    const p = await programWith(`
      model Invalid {
        @Sgg.prePopulate("not_a_provider")
        answer: string;
      }
    `);
    expect(p.diagnostics.length).toBeGreaterThan(0);
  });
  it.each([
    ["prePopulate(Sgg.PrePopulationRule.agencyName)", "int32"],
    ["postPopulate(Sgg.PostPopulationRule.currentDate)", "boolean"],
    ["postPopulate(Sgg.PostPopulationRule.signature)", "int32"],
  ])(
    "rejects a provider bound to an incompatible answer: %s",
    async (decorator, type) => {
      const p = await programWith(
        `model WrongType { @Sgg.${decorator} answer: ${type}; }`,
      );
      expect(p.diagnostics.map((d) => d.code)).toContain(
        "simpler-forms-sgg/invalid-population-target",
      );
    },
  );

  it("rejects a date-order declaration on numbers", async () => {
    const p = await programWith(
      `model NotDates { start: int32; @Validation.notBefore(NotDates.start) end: int32; }`,
    );
    expect(p.diagnostics.map((d) => d.code)).toContain(
      "simpler-forms-sgg/invalid-date-order-target",
    );
  });
});
