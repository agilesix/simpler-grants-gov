import type { EmitContext, Model } from "@typespec/compiler";
import { emitFile, resolvePath } from "@typespec/compiler";
import { mappingTargets, resolveForms } from "./simpler-forms.js";
import { reportDiagnostic, type XmlEmitterOptions } from "./lib.js";
import { xmlTransform } from "./xml-transform.js";

/**
 * Writes Grants.gov XML transform rules -- the `xml_transform.json` the API's XML generation
 * reads -- for every submission linked in a configured mapping, beside the artifacts of each
 * form presenting it:
 *
 *   forms/<form id>/xml-transform.json
 *
 * Point `emitter-output-dir` at the `simpler-forms` emitter's to keep a form's artifacts in
 * one directory. One file per form, so a submission linked in two configured mappings is an
 * error.
 */
export async function $onEmit(
  context: EmitContext<XmlEmitterOptions>,
): Promise<void> {
  const { program, options } = context;
  const casing = options["property-casing"] ?? "preserve";
  const direction = options["mapping-direction"] ?? "from";
  const declared = mappingTargets(program);
  const emitted = new Map<Model, string>();

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

    const { forms } = resolveForms(program);
    // Each form carries its own copy of its submission's block, so match them by model.
    const submissions = new Map(
      forms.map((form) => [form.submission.model as Model, form.submission]),
    );
    for (const [model, submission] of submissions) {
      const rules = xmlTransform(program, model, mapping, casing, direction);
      if (!rules) continue;
      const first = emitted.get(model);
      if (first) {
        reportDiagnostic(program, {
          code: "xml-transform-collision",
          target: model,
          format: { form: submission.id, first, second: name },
        });
        continue;
      }
      emitted.set(model, name);
      for (const form of forms.filter((f) => f.submission.model === model))
        await emitFile(program, {
          path: resolvePath(
            context.emitterOutputDir,
            `forms/${form.id}/xml-transform.json`,
          ),
          content: `${JSON.stringify(rules, null, 2)}\n`,
        });
    }
  }
}
