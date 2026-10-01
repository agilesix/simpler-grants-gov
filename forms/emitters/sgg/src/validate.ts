import type { Model, ModelProperty, Namespace, Program } from "@typespec/compiler";
import { allBlocks, type Block } from "simpler-forms";
import { readBlock } from "simpler-forms";
import { reportDiagnostic, stateKeys } from "./lib.js";
import { modelMultiFields, modelPrePopulate, modelRenderer } from "./model.js";

export function $onValidate(program: Program): void {
  for (const block of allBlocks(program)) {
    if (block.model.kind !== "Model") continue;
    checkNoSggInBank(program, block);
    checkMultiFieldSections(program, block);
    checkRendererIgnoresLayout(program, block);
  }
  checkFormOnly(program, stateKeys.sync, "sync");
  checkFormOnly(program, stateKeys.renderer, "renderer");
}

/**
 * `@Sgg.sync` and `@Sgg.renderer` describe installing and drawing a form, and nothing else
 * is installed or drawn. Read from the state map rather than `allBlocks`, because a model
 * that is neither a question nor a form never appears as a block.
 */
function checkFormOnly(program: Program, key: symbol, decorator: string): void {
  for (const target of program.stateMap(key).keys()) {
    const model = target as Model;
    if (readBlock(program, model)?.kind === "form") continue;
    reportDiagnostic(program, {
      code: "sgg-not-a-form",
      target: model,
      format: { decorator, name: model.name },
    });
  }
}

/** Under JSON Forms the SGG UI schema is not installed, so its layout decorators are inert. */
function checkRendererIgnoresLayout(program: Program, block: Block): void {
  if (block.kind !== "form") return;
  const model = block.model as Model;
  if (modelRenderer(program, model) !== "jsonforms") return;
  const report = (decorator: string) =>
    reportDiagnostic(program, {
      code: "renderer-ignores-sgg-layout",
      target: model,
      format: { name: model.name, decorator },
    });
  if (modelMultiFields(program, model).length) report("multiField");
  const fieldLists = [...program.stateMap(stateKeys.fieldList).keys()] as ModelProperty[];
  if (fieldLists.some((prop) => prop.model === model)) report("fieldList");
}

/**
 * `@Sgg.*` names one consumer's rule vocabulary. A question is shared, so a question
 * carrying it would export this consumer's choices to every form that composes it.
 */
function checkNoSggInBank(program: Program, block: Block): void {
  if (!Object.keys(modelPrePopulate(program, block.model as Model)).length) return;
  if (!inQuestionBank(block.model.namespace)) return;
  reportDiagnostic(program, {
    code: "sgg-outside-forms",
    target: block.model,
    format: { decorator: "prePopulate", name: block.model.name },
  });
}

function inQuestionBank(namespace: Namespace | undefined): boolean {
  for (let ns = namespace; ns; ns = ns.namespace) {
    if (ns.name === "QuestionBank") return true;
  }
  return false;
}

/** A multiField naming a section the form does not declare renders nowhere. */
function checkMultiFieldSections(program: Program, block: Block): void {
  if (!block.sections) return;
  const declared = new Set([...block.sections.members.values()].map((m) => m.name));
  for (const entry of modelMultiFields(program, block.model as Model)) {
    if (declared.has(entry.section)) continue;
    reportDiagnostic(program, {
      code: "multi-field-section-unknown",
      target: block.model,
      format: { section: entry.section, declared: [...declared].join(", ") },
    });
  }
}

export { readBlock };
