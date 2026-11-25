import type { ControlElement } from "@jsonforms/core";
import type { RJSFSchema } from "@rjsf/utils";
import { describe, expect, it } from "vitest";

import { controlToNodes } from "./jsonFormsUiSchema";

const schema: RJSFSchema = {
  type: "object",
  properties: {
    city: { type: "string", title: "City", description: "Enter the city." },
  },
};

const control = (extra: Partial<ControlElement>): ControlElement => ({
  type: "Control",
  scope: "#/properties/city",
  ...extra,
});

describe("controlToNodes", () => {
  it("shows a control's own label and help on its field", () => {
    const [node] = controlToNodes(
      control({ label: "7d. City", options: { description: "Your city." } }),
      schema,
    );
    expect(node).toMatchObject({
      schema: { title: "7d. City", type: "string", description: "Your city." },
    });
  });

  it("keeps the schema's title when a control sets no label", () => {
    const [node] = controlToNodes(control({}), schema);
    expect(node).not.toHaveProperty("schema");
  });
});
