import type { UISchemaElement } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { JsonFormsUiSchema } from "./jsonFormsUiSchema";
import { AdapterContext, renderers } from "./renderers";

describe("instruction sections through the native widget adapter", () => {
  const schema = { type: "object" as const, properties: {} };
  const layout = (widget?: string) => ({
    type: "Group",
    elements: [
      {
        type: "Group",
        label: "Assurances",
        elements: [],
        options: {
          widget,
          description:
            '<ol><li>Read all requirements.</li></ol><input name="fake" value="yes">',
        },
      },
    ],
  });
  const draw = (widget?: string) => {
    const uischema = layout(widget);
    return renderToStaticMarkup(
      <AdapterContext.Provider
        value={{
          schema,
          formData: {},
          errors: null,
          requiredFieldPaths: [],
          rootUiSchema: uischema as JsonFormsUiSchema,
        }}
      >
        <JsonForms
          schema={schema}
          data={{}}
          uischema={uischema as UISchemaElement}
          renderers={renderers}
        />
      </AdapterContext.Provider>,
    );
  };
  it("carries the Instructions marker into the actual SGG fieldset", () => {
    const html = draw("Instructions");
    expect(html).toContain("<ol><li>Read all requirements.</li></ol>");
    expect(html).toContain("<fieldset");
    expect(html).not.toContain("<input");
  });
  it("leaves other native section descriptions as escaped text", () => {
    const html = draw();
    expect(html).toContain("&lt;ol&gt;");
    expect(html).not.toContain("<ol>");
  });
});
