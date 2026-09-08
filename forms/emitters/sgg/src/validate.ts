import type { Model, Namespace, Program } from "@typespec/compiler";
import { allBlocks, type Block } from "simpler-forms";
import { readBlock } from "simpler-forms";
import { reportDiagnostic } from "./lib.js";
import { modelMultiFields, modelPrePopulate } from "./model.js";

export function $onValidate(program: Program): void {
  for (const block of allBlocks(program)) {
    if (block.model.kind !== "Model") continue;
    checkNoSggInBank(program, block);
    checkMultiFieldSections(program, block);
  }
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
