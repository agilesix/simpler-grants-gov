import type { EmitContext, Model } from "@typespec/compiler";
import { emitFile, resolvePath } from "@typespec/compiler";
import { allBlocks, mappingTargets } from "./simpler-forms.js";
import { reportDiagnostic, type XmlEmitterOptions } from "./lib.js";
import { xmlTransform } from "./xml-transform.js";

/**
 * Writes Grants.gov XML transform rules -- the `xml_transform.json` the API's XML generation
 * reads -- for every form linked in each configured mapping:
 *
 *   <mapping>/forms/<form id>/xml-transform.json
 *
 * One directory per mapping, so two XSD versions of one form sit side by side.
 */
export async function $onEmit(
  context: EmitContext<XmlEmitterOptions>,
): Promise<void> {
  const { program, options } = context;
  const casing = options["property-casing"] ?? "preserve";
  const declared = mappingTargets(program);

  for (const name of options["mapping-targets"]) {
    const mapping = declared.find((member) => member.name === name);
    if (!mapping) {
      reportDiagnostic(program, {
        code: "mapping-target-unknown",
        target: program.getGlobalNamespaceType(),
        format: {
          name,
          members: declared.map((m) => m.name).join(", ") || "none",
        },
      });
      continue;
    }
    if (program.compilerOptions.noEmit) continue;

    for (const block of allBlocks(program)) {
      if (block.kind !== "form") continue;
      const rules = xmlTransform(
        program,
        block.model as Model,
        mapping,
        casing,
      );
      if (!rules) continue;
      await emitFile(program, {
        path: resolvePath(
          context.emitterOutputDir,
          `${name}/forms/${block.id}/xml-transform.json`,
        ),
        content: `${JSON.stringify(rules, null, 2)}\n`,
      });
    }
  }
}
