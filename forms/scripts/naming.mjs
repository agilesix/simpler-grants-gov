/**
 * The canonical artifacts name a field the way the specification does -- camelCase,
 * matching the question's own vocabulary. This application names it snake_case, because
 * stored application_response rows are keyed that way, the Budget424aSection components
 * hardcode those literals, and json_to_xml_schema paths use them.
 *
 * Renaming the stored data is a production migration, so the projection lives here: one
 * transformation applied at the three places a field name appears -- the schema's
 * property keys, the UI schema's JSON pointers, and the rule schema's keys.
 */

/** `activityLineItems` -> `activity_line_items`. Digits stay attached to the run they end. */
export const toSggName = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();

/** Rewrite the property names in a JSON Schema, recursively. */
export function projectSchema(node) {
  if (Array.isArray(node)) return node.map(projectSchema);
  if (node === null || typeof node !== "object") return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "properties" && value && typeof value === "object") {
      out.properties = Object.fromEntries(
        Object.entries(value).map(([name, schema]) => [toSggName(name), projectSchema(schema)]),
      );
    } else if (key === "required" && Array.isArray(value)) {
      out.required = value.map(toSggName);
    } else if (key === "dependentRequired" && value && typeof value === "object") {
      out.dependentRequired = Object.fromEntries(
        Object.entries(value).map(([name, deps]) => [toSggName(name), deps.map(toSggName)]),
      );
    } else if (key === "$ref" && typeof value === "string") {
      // A $ref names a file, not a field, so its path is left alone.
      out.$ref = value;
    } else {
      out[key] = projectSchema(value);
    }
  }
  return out;
}

/** `/properties/activityLineItems/items/properties/budgetSummary` -> snake_case. */
export const projectPointer = (pointer) =>
  pointer
    .split("/")
    .map((segment, i, all) => (i > 0 && all[i - 1] === "properties" ? toSggName(segment) : segment))
    .join("/");

/** Rewrite every `definition` pointer in a UI schema, recursively. */
export function projectUiSchema(node) {
  if (Array.isArray(node)) return node.map(projectUiSchema);
  if (node === null || typeof node !== "object") return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === "definition") {
      out.definition = Array.isArray(value) ? value.map(projectPointer) : projectPointer(value);
    } else {
      out[key] = projectUiSchema(value);
    }
  }
  return out;
}

/** Rule schemas are keyed by field path; nested rule objects are keyed the same way. */
export function projectRuleSchema(node) {
  if (Array.isArray(node)) return node.map(projectRuleSchema);
  if (node === null || typeof node !== "object") return node;

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      // Keys beginning with `_` are directives, not field names.
      key.startsWith("_") || key.includes("_") ? key : toSggName(key),
      projectRuleSchema(value),
    ]),
  );
}
