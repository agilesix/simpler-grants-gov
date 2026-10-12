import type { DecoratorContext, Model, Program } from "@typespec/compiler";
import { stateKeys } from "./lib.js";

export { $lib } from "./lib.js";
export { $onEmit } from "./emitter.js";
export { xmlTransform, type XmlTransformRules } from "./xml-transform.js";

export const $xsd = (ctx: DecoratorContext, target: Model, url: string) =>
  ctx.program.stateMap(stateKeys.xsd).set(target, url);

/** Each XSD TypeSpec model's root, with the URL of the XSD it models. */
export const xsdRoots = (program: Program) =>
  program.stateMap(stateKeys.xsd) as Map<Model, string>;

export const $decorators = {
  GrantsGov: { xsd: $xsd },
};
