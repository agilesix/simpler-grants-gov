import type { DecoratorContext, Model } from "@typespec/compiler";
import { stateKeys } from "./lib.js";

export { $lib } from "./lib.js";
export { $onEmit } from "./emitter.js";
export { xmlTransform, type XmlTransformRules } from "./xml-transform.js";

export const $xsd = (ctx: DecoratorContext, target: Model, url: string) =>
  ctx.program.stateMap(stateKeys.xsd).set(target, url);

export const $decorators = {
  GrantsGov: { xsd: $xsd },
};
