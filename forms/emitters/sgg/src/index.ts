import * as d from "./decorators.js";

export { $lib } from "./lib.js";
export { $onValidate } from "./validate.js";
export { $onEmit } from "./emitter.js";
export { emitSggUi } from "./ui-schema.js";
export { emitSggRules } from "./rules.js";

export const $decorators = {
  "SimplerForms.Sgg": {
    prePopulate: d.$prePopulate,
    multiField: d.$multiField,
    fieldList: d.$fieldList,
  },
};
