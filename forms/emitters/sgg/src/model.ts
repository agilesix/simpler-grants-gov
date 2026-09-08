import type { Model, ModelProperty, Program } from "@typespec/compiler";
import { stateKeys } from "./lib.js";

const g = (p: Program, key: symbol, target: Model | ModelProperty) =>
  p.stateMap(key).get(target);

/** `@Sgg.prePopulate`: canonical data path -> rule name, declared on the form. */
export const modelPrePopulate = (p: Program, model: Model) =>
  (g(p, stateKeys.prePopulate, model) as Record<string, string> | undefined) ?? {};

/** `@Sgg.multiField` declarations on a form, in the order they were written. */
export const modelMultiFields = (p: Program, model: Model) =>
  (g(p, stateKeys.multiField, model) as { section: string; widget: string }[] | undefined) ?? [];

/** `@Sgg.fieldList` options for one form-local repeatable property. */
export const propSggFieldList = (p: Program, prop: ModelProperty) =>
  (g(p, stateKeys.fieldList, prop) as {
    hideFieldListHeading?: boolean;
    validateBeforeAdd?: boolean;
  } | undefined) ?? {};
