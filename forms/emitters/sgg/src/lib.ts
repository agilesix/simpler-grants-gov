import { createTypeSpecLibrary, paramMessage } from "@typespec/compiler";

/**
 * A TypeSpec library of its own, rather than a plugin registered with `simpler-forms`.
 *
 * The compiler already supports listing several libraries in `tspconfig.yaml`, each with
 * its own decorators, diagnostics, state and emitter, so a plugin interface in the core
 * would duplicate a mechanism that exists. It also keeps the dependency one-directional:
 * this package reads the core's public API and the core knows nothing about it.
 */
export const $lib = createTypeSpecLibrary({
  name: "simpler-forms-sgg",
  // Pins the diagnostic short name independent of the package name, so moving this
  // into an npm scope later leaves every `#suppress "sgg/<rule>"` working.
  alias: "sgg",
  diagnostics: {
    "sgg-outside-forms": {
      severity: "error",
      messages: {
        default: paramMessage`@Sgg.${"decorator"} is a target vocabulary and may only appear on a form. ${"name"} is in the question bank.`,
      },
    },
    "multi-field-section-unknown": {
      severity: "error",
      messages: {
        default: paramMessage`@Sgg.multiField names section "${"section"}", which this form does not declare (it has ${"declared"}).`,
      },
    },
  },
  state: {
    prePopulate: {},
    multiField: {},
    fieldList: {},
  },
} as const);

export const { reportDiagnostic, createDiagnostic, stateKeys } = $lib;
