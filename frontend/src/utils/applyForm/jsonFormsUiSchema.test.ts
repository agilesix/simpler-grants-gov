import type { ControlElement, UISchemaElement } from "@jsonforms/core";
import { RJSFSchema } from "@rjsf/utils";
import {
  controlToNodes,
  groupName,
  jsonFormsToUiSchema,
  unadaptableScopes,
} from "src/utils/applyForm/jsonFormsUiSchema";
import { validateUiSchema } from "src/utils/applyForm/validateUiSchema";

const schema: RJSFSchema = {
  type: "object",
  properties: {
    title: { type: "string", title: "Title" },
    address: {
      type: "object",
      properties: {
        street1: { type: "string" },
        city: { type: "string" },
      },
    },
    contacts: {
      type: "array",
      title: "Contacts",
      items: {
        type: "object",
        properties: {
          role: { type: "string" },
          name: {
            type: "object",
            properties: { first: { type: "string" }, last: { type: "string" } },
          },
        },
      },
    },
    nested: {
      type: "object",
      properties: {
        people: {
          type: "array",
          items: { type: "object", properties: { id: { type: "string" } } },
        },
      },
    },
  },
};

const control = (
  scope: string,
  extra: Partial<ControlElement> = {},
): ControlElement => ({ type: "Control", scope, ...extra });

describe("controlToNodes", () => {
  it("maps a control on a scalar to one field", () => {
    expect(controlToNodes(control("#/properties/title"), schema)).toEqual([
      { type: "field", definition: "/properties/title" },
    ]);
  });

  it("carries the widget a control names through to the field", () => {
    expect(
      controlToNodes(
        control("#/properties/title", { options: { widget: "Attachment" } }),
        schema,
      ),
    ).toEqual([
      { type: "field", definition: "/properties/title", widget: "Attachment" },
    ]);
  });

  it("maps a readonly control to a disabled field", () => {
    expect(
      controlToNodes(
        control("#/properties/title", { options: { readonly: true } }),
        schema,
      ),
    ).toEqual([{ type: "null", definition: "/properties/title" }]);
  });

  it("expands a control on an object into its leaves", () => {
    expect(controlToNodes(control("#/properties/address"), schema)).toEqual([
      { type: "field", definition: "/properties/address/properties/street1" },
      { type: "field", definition: "/properties/address/properties/city" },
    ]);
  });

  it("maps a top-level array of objects to a field list over the item's leaves", () => {
    expect(controlToNodes(control("#/properties/contacts"), schema)).toEqual([
      {
        type: "fieldList",
        name: "contacts",
        label: "Contacts",
        description: undefined,
        children: [
          {
            type: "field",
            definition: "/properties/contacts/items/properties/role",
          },
          {
            type: "field",
            definition:
              "/properties/contacts/items/properties/name/properties/first",
          },
          {
            type: "field",
            definition:
              "/properties/contacts/items/properties/name/properties/last",
          },
        ],
      },
    ]);
  });

  it("returns nothing for a control no widget can draw", () => {
    expect(
      controlToNodes(control("#/properties/nested/properties/people"), schema),
    ).toEqual([]);
    expect(controlToNodes(control("#/properties/absent"), schema)).toEqual([]);
    expect(controlToNodes(control("#"), schema)).toEqual([]);
  });
});

describe("jsonFormsToUiSchema", () => {
  const uiSchema: UISchemaElement = {
    type: "Group",
    label: "The Form Itself",
    elements: [
      control("#/properties/title"),
      {
        type: "Group",
        label: "Where & Who",
        elements: [
          control("#/properties/address"),
          control("#/properties/contacts"),
        ],
      },
      {
        type: "VerticalLayout",
        elements: [control("#/properties/title")],
      },
    ],
  };

  it("drops the root layout, turns labeled groups into sections and flattens the rest", () => {
    const tree = jsonFormsToUiSchema(uiSchema, schema);

    expect(tree.map((node) => node.type)).toEqual([
      "field",
      "section",
      "field",
    ]);
    expect(tree[1]).toMatchObject({
      type: "section",
      name: "where-who",
      label: "Where & Who",
    });
  });

  it("produces a tree the UI schema validator accepts", () => {
    expect(validateUiSchema(jsonFormsToUiSchema(uiSchema, schema))).toBeFalsy();
  });
});

describe("unadaptableScopes", () => {
  it("lists every control no widget can draw", () => {
    const uiSchema = {
      type: "Group",
      elements: [
        control("#/properties/title"),
        control("#/properties/nested/properties/people"),
      ],
    } as UISchemaElement;

    expect(unadaptableScopes(uiSchema, schema)).toEqual([
      "#/properties/nested/properties/people",
    ]);
  });
});

describe("groupName", () => {
  it("slugs a label into a stable section name", () => {
    expect(groupName("Section A: Budget Summary")).toEqual(
      "section-a-budget-summary",
    );
  });
});
