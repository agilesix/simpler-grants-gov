import type { EmitContext, Model } from "@typespec/compiler";
import { emitFile, resolvePath } from "@typespec/compiler";
import { allBlocks } from "simpler-forms";
import { emitSggUi } from "./ui-schema.js";
import { emitSggRules } from "./rules.js";
import { modelRenderer, modelSync } from "./model.js";

/**
 * Writes the two artifacts this application's form registry consumes, one directory per
 * form. The canonical artifacts -- schema.json, ui.json, index.json -- are written by
 * `simpler-forms`, which runs as a separate emitter against the same program, so this
 * emitter deliberately writes nothing that overlaps them.
 */
export async function $onEmit(context: EmitContext): Promise<void> {
  const { program } = context;
  if (program.compilerOptions.noEmit) return;

  const write = async (path: string, value: unknown) =>
    emitFile(program, {
      path: resolvePath(context.emitterOutputDir, path),
      content: `${JSON.stringify(value, null, 2)}\n`,
    });

  for (const block of allBlocks(program)) {
    if (block.kind !== "form") continue;
    const dir = `forms/${block.meta.id}`;
    await write(`${dir}/ui-schema.json`, emitSggUi(program, block));
    const rules = emitSggRules(program, block);
    await write(`${dir}/rule-schema.json`, Object.keys(rules).length ? rules : null);
    // What scripts/sync.mjs needs to know about installing the form, so it reads a file
    // rather than the specification.
    await write(`${dir}/sgg.json`, {
      sync: modelSync(program, block.model as Model),
      renderer: modelRenderer(program, block.model as Model),
    });
  }
}
