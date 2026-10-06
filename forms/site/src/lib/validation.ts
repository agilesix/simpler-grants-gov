import type { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import Ajv2020 from "ajv/dist/2020.js";

/** The emitted schemas declare draft 2020-12; Ajv's default export is draft-07. */
export const createAjv = () => {
  const ajv = new Ajv2020({ allErrors: true, verbose: true, strict: false });
  addFormats(ajv);
  return ajv;
};

/** A validation warning in the shape the API returns it (`FormValidationWarning`). */
export interface ValidationWarning {
  field: string;
  message: string;
  type: string;
  value: string | null;
}

/** Ajv reports a failed `if/then` twice: the `then` failure and a summary `if` error. */
const isReportable = (error: ErrorObject) => error.keyword !== "if";

/** `/keyContacts/0/name` -> `$.keyContacts[0].name`, the API's JSON path spelling. */
const toJsonPath = (instancePath: string) =>
  instancePath
    .split("/")
    .filter(Boolean)
    .reduce(
      (acc, segment) =>
        /^\d+$/.test(segment) ? `${acc}[${segment}]` : `${acc}.${segment}`,
      "$",
    );

const quoted = (value: unknown) =>
  `'${typeof value === "string" ? value : JSON.stringify(value)}'`;

/** The message Python's `jsonschema` gives for the same failure. */
const pythonMessage = (error: ErrorObject): string => {
  const value = error.data;
  const params = error.params as Record<string, unknown>;
  switch (error.keyword) {
    case "maxLength":
    case "maxItems":
      return `${quoted(value)} is too long`;
    case "minLength":
      return `${quoted(value)} is too short`;
    case "minItems":
      return "[] should be non-empty";
    case "format":
      return `${quoted(value)} is not a ${quoted(params.format)}`;
    case "enum":
      return `${quoted(value)} is not one of ${JSON.stringify(params.allowedValues)}`;
    default:
      return error.message ?? "is invalid";
  }
};

/**
 * Convert Ajv errors into the warnings the API produces with Python's `jsonschema`
 * (api/src/form_schema/jsonschema_validator.py), so the frontend's own warning formatting
 * (`buildWarningTree`) can attach and word them exactly as it does after a save.
 */
export const toValidationWarnings = (
  errors: ErrorObject[],
): ValidationWarning[] =>
  errors.filter(isReportable).map((error) => {
    const field = toJsonPath(error.instancePath);
    if (error.keyword === "required") {
      const missing = (error.params as { missingProperty: string })
        .missingProperty;
      return {
        field: `${field}.${missing}`,
        message: `'${missing}' is a required property`,
        type: "required",
        value: null,
      };
    }
    return {
      field,
      message: pythonMessage(error),
      type: error.keyword,
      value: null,
    };
  });
