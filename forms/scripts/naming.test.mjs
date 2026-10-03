import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { projectJsonFormsUiSchema } from "./naming.mjs";

describe("projectJsonFormsUiSchema", () => {
  it("projects every scope pointer to snake_case", () => {
    const ui = {
      type: "Group",
      elements: [{ type: "Control", scope: "#/properties/keyContacts/items/properties/firstName" }],
    };
    assert.deepEqual(projectJsonFormsUiSchema(ui).elements[0].scope,
      "#/properties/key_contacts/items/properties/first_name");
  });

  it("projects a rule condition's scope and the field names in its schema", () => {
    const control = {
      type: "Control",
      scope: "#/properties/additionalProfiles",
      rule: {
        effect: "ENABLE",
        condition: {
          scope: "#/properties/seniorKeyPersons",
          schema: { properties: { firstName: { const: "x" } }, required: ["firstName"] },
        },
      },
    };
    assert.deepEqual(projectJsonFormsUiSchema(control).rule, {
      effect: "ENABLE",
      condition: {
        scope: "#/properties/senior_key_persons",
        schema: { properties: { first_name: { const: "x" } }, required: ["first_name"] },
      },
    });
  });

  it("projects the scopes inside a list's options.detail, leaving the other options alone", () => {
    const list = {
      type: "Control",
      scope: "#/properties/keyContacts",
      options: {
        widget: "Table",
        detail: {
          type: "Group",
          elements: [{ type: "Control", scope: "#/properties/projectRole" }],
        },
      },
    };
    assert.deepEqual(projectJsonFormsUiSchema(list).options, {
      widget: "Table",
      detail: {
        type: "Group",
        elements: [{ type: "Control", scope: "#/properties/project_role" }],
      },
    });
  });

  it("leaves options untouched, since they name widgets rather than fields", () => {
    const control = { type: "Control", scope: "#", options: { widget: "Attachment", readonlyWhen: "fooBar" } };
    assert.deepEqual(projectJsonFormsUiSchema(control).options, control.options);
  });
});
