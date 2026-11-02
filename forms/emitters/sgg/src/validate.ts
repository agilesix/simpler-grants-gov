import {
  getFormat,
  isStringType,
  navigateProgram,
  type Model,
  type ModelProperty,
  type Program,
} from "@typespec/compiler";
import { formIdentities } from "form-library-xml";
import { propNotBefore, readBlock } from "simpler-forms";
import { reportDiagnostic, stateKeys } from "./lib.js";
import { modelSync } from "./model.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function dateOnly(program: Program, property: ModelProperty): boolean {
  if (getFormat(program, property) === "date") return true;
  for (
    let type = property.type.kind === "Scalar" ? property.type : undefined;
    type;
    type = type.baseScalar
  )
    if (
      program.checker.isStdType(type, "plainDate") ||
      getFormat(program, type) === "date"
    )
      return true;
  return false;
}

/**
 * `@Sgg.sync` installs a form, so it belongs on a model with `@Meta.form`, and that form
 * needs the Grants.gov identity the API registers it under. Read from the state map rather
 * than `allBlocks`, because a model that is neither a question nor a form is not a block.
 */
export function $onValidate(program: Program): void {
  for (const bindings of [stateKeys.prePopulation, stateKeys.postPopulation])
    for (const [target, rule] of program.stateMap(bindings)) {
      const property = target as ModelProperty;
      if (
        !isStringType(program, property.type) &&
        !(rule === "current_date" && dateOnly(program, property))
      )
        reportDiagnostic(program, {
          code: "invalid-population-target",
          target,
          format: { rule: String(rule), name: property.name },
        });
    }
  navigateProgram(program, {
    modelProperty(property) {
      const source = propNotBefore(program, property);
      if (
        source &&
        (!dateOnly(program, property) || !dateOnly(program, source))
      )
        reportDiagnostic(program, {
          code: "invalid-date-order-target",
          target: property,
          format: { name: property.name },
        });
    },
  });
  for (const target of program.stateMap(stateKeys.prePopulation).keys())
    if (program.stateMap(stateKeys.postPopulation).has(target))
      reportDiagnostic(program, {
        code: "conflicting-population",
        target,
        format: { name: (target as ModelProperty).name },
      });
  const identities = formIdentities(program);
  for (const target of program.stateMap(stateKeys.sync).keys()) {
    const model = target as Model;
    if (readBlock(program, model)?.kind !== "form") {
      reportDiagnostic(program, {
        code: "sgg-not-a-form",
        target: model,
        format: { decorator: "sync", name: model.name },
      });
      continue;
    }
    if (!identities.has(model))
      reportDiagnostic(program, {
        code: "sync-without-identity",
        target: model,
        format: { name: model.name },
      });
    const { instructions } = modelSync(program, model)!;
    if (instructions !== undefined && !UUID.test(instructions))
      reportDiagnostic(program, {
        code: "invalid-instructions",
        target: model,
        format: { name: model.name, value: instructions },
      });
  }
}
