import type {
  ControlElement,
  GroupLayout,
  Layout,
  UISchemaElement,
} from "@jsonforms/core";
import { RJSFSchema } from "@rjsf/utils";
import {
  UiSchema,
  UiSchemaField,
  UiSchemaFieldList,
  UiSchemaNode,
  WidgetTypes,
} from "src/types/applyForm/types";
import { getByPointer } from "src/utils/formData/formDataUtils";

/*
  A form whose `form_renderer` is "jsonforms" arrives with a JSON Forms UI schema instead of
  the section/field tree the rest of the apply-form code reads. JSON Forms lays the form out
  and evaluates its rules, but every control it draws is still one of our widgets, reached
  through the same `getFieldConfig` -> `renderWidget` path as any other form.

  The functions here translate between the two shapes, so warnings, navigation, print and
  the UI schema validator all keep working off the tree they already understand.
*/

export type JsonFormsUiSchema = UISchemaElement;

type FieldNode = UiSchemaField | UiSchemaFieldList;
type Definition = `/properties/${string}`;

const isLayout = (element: UISchemaElement): element is Layout =>
  Array.isArray((element as Layout).elements);

const isControlElement = (
  element: UISchemaElement,
): element is ControlElement => element.type === "Control";

/** `#/properties/a/properties/b` -> `/properties/a/properties/b` */
const scopeToDefinition = (scope: string): Definition | undefined =>
  scope.startsWith("#/properties/")
    ? (scope.slice(1) as Definition)
    : undefined;

const schemaAt = (
  schema: RJSFSchema,
  definition: string,
): RJSFSchema | undefined => {
  try {
    const found = getByPointer(schema, definition);
    return found && typeof found === "object" ? found : undefined;
  } catch {
    return undefined;
  }
};

const isObjectSchema = (schema: RJSFSchema): boolean =>
  !!schema.properties && typeof schema.properties === "object";

const itemSchema = (schema: RJSFSchema): RJSFSchema | undefined =>
  schema.type === "array" &&
  schema.items &&
  typeof schema.items === "object" &&
  !Array.isArray(schema.items)
    ? schema.items
    : undefined;

/** Every leaf beneath an object, in declaration order, as definition pointers. */
const leafDefinitions = (schema: RJSFSchema, base: Definition): Definition[] =>
  isObjectSchema(schema)
    ? Object.entries(schema.properties as Record<string, RJSFSchema>).flatMap(
        ([name, child]) => leafDefinitions(child, `${base}/properties/${name}`),
      )
    : [base];

/** A top-level property, the only place a field list may sit. */
const ROOT_PROPERTY = /^\/properties\/([^/]+)$/;

/**
 * The field nodes one JSON Forms control stands for.
 *
 * A control scoped to a scalar is one field. A control scoped to an object is each of the
 * object's leaves, which is how the SGG UI schema lists a composed question. A control
 * scoped to a top-level array of objects is a field list. Anything else returns no nodes,
 * and JSON Forms falls back to its own renderer for it.
 */
export const controlToNodes = (
  control: ControlElement,
  schema: RJSFSchema,
): FieldNode[] => {
  const definition = scopeToDefinition(control.scope);
  if (!definition) return [];
  const fieldSchema = schemaAt(schema, definition);
  if (!fieldSchema) return [];

  const options = (control.options ?? {}) as {
    readonly?: boolean;
    widget?: WidgetTypes;
  };
  const type = options.readonly ? "null" : "field";

  const items = itemSchema(fieldSchema);
  if (items && isObjectSchema(items)) {
    const rootProperty = ROOT_PROPERTY.exec(definition);
    if (!rootProperty) return [];
    const name = rootProperty[1];
    return [
      {
        type: "fieldList",
        name,
        label:
          (typeof control.label === "string" ? control.label : undefined) ??
          fieldSchema.title ??
          name,
        description: fieldSchema.description,
        children: leafDefinitions(items, `${definition}/items`).map(
          (childDefinition) => ({ type, definition: childDefinition }),
        ),
      },
    ];
  }

  if (isObjectSchema(fieldSchema)) {
    return leafDefinitions(fieldSchema, definition).map((leaf) => ({
      type,
      definition: leaf,
    }));
  }

  return [
    {
      type,
      definition,
      ...(options.widget ? { widget: options.widget } : {}),
    },
  ];
};

/** A section name from a group label, shared by the fieldset id and the nav link to it. */
export const groupName = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const groupLabel = (element: UISchemaElement): string | undefined =>
  element.type === "Group" ? (element as GroupLayout).label : undefined;

const convertElement = (
  element: UISchemaElement,
  schema: RJSFSchema,
): UiSchemaNode[] => {
  if (isControlElement(element)) return controlToNodes(element, schema);
  if (!isLayout(element)) return [];

  const children = element.elements.flatMap((child) =>
    convertElement(child, schema),
  );
  const label = groupLabel(element);
  return label
    ? [{ type: "section", name: groupName(label), label, children }]
    : children;
};

/**
 * The section/field tree equivalent to a JSON Forms UI schema, for the code that reads
 * that tree: warning formatting, navigation, and the UI schema validator. The root layout
 * is the form itself, whose title the page already shows, so its elements become the top
 * level.
 */
export const jsonFormsToUiSchema = (
  uiSchema: JsonFormsUiSchema,
  schema: RJSFSchema,
): UiSchema =>
  isLayout(uiSchema)
    ? uiSchema.elements.flatMap((element) => convertElement(element, schema))
    : convertElement(uiSchema, schema);

/** Control scopes no widget can draw, which JSON Forms renders with its own fallback. */
export const unadaptableScopes = (
  uiSchema: JsonFormsUiSchema,
  schema: RJSFSchema,
): string[] => {
  if (isControlElement(uiSchema)) {
    return controlToNodes(uiSchema, schema).length ? [] : [uiSchema.scope];
  }
  return isLayout(uiSchema)
    ? uiSchema.elements.flatMap((element) => unadaptableScopes(element, schema))
    : [];
};
