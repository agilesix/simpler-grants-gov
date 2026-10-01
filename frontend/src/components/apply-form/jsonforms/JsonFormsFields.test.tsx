import type { UISchemaElement } from "@jsonforms/core";
import { RJSFSchema } from "@rjsf/utils";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { JsonFormsFields } from "src/components/apply-form/jsonforms/JsonFormsFields";

const schema: RJSFSchema = {
  type: "object",
  required: ["title"],
  properties: {
    title: { type: "string", title: "Project Title", maxLength: 60 },
    has_partner: { type: "string", title: "Has Partner", maxLength: 10 },
    partner_name: { type: "string", title: "Partner Name", maxLength: 60 },
  },
};

const uiSchema = {
  type: "Group",
  label: "The Form",
  elements: [
    {
      type: "Group",
      label: "Project Details",
      elements: [
        { type: "Control", scope: "#/properties/title" },
        { type: "Control", scope: "#/properties/has_partner" },
        {
          type: "Control",
          scope: "#/properties/partner_name",
          rule: {
            effect: "ENABLE",
            condition: {
              scope: "#/properties/has_partner",
              schema: { const: "yes" },
            },
          },
        },
      ],
    },
  ],
} as UISchemaElement;

const renderFields = (formData: object = {}) =>
  render(
    <form>
      <JsonFormsFields
        errors={null}
        formData={formData}
        schema={schema}
        uiSchema={uiSchema}
      />
    </form>,
  );

describe("JsonFormsFields", () => {
  it("draws each control with the widget and field name the SGG renderer would use", () => {
    renderFields({ title: "Saved title" });

    const title = screen.getByTestId("title");
    expect(title).toHaveAttribute("name", "title");
    expect(title).toHaveValue("Saved title");
    expect(title).toBeRequired();
  });

  it("wraps a labeled group in the section fieldset the nav links to", () => {
    renderFields();

    const section = screen.getByRole("group");
    expect(section).toHaveAttribute("id", "form-section-project-details");
    expect(within(section).getByText("Project Details")).toBeInTheDocument();
    expect(screen.queryByText("The Form")).not.toBeInTheDocument();
  });

  it("evaluates rules against the saved data", () => {
    renderFields({ has_partner: "yes" });

    expect(screen.getByTestId("partner_name")).toBeEnabled();
  });

  it("re-evaluates rules as the applicant types", () => {
    renderFields();
    expect(screen.getByTestId("partner_name")).toBeDisabled();

    const hasPartner = screen.getByTestId("has_partner");
    fireEvent.change(hasPartner, { target: { value: "yes" } });
    fireEvent.input(hasPartner, { target: { value: "yes" } });

    expect(screen.getByTestId("partner_name")).toBeEnabled();
  });

  it("uses the print widgets when printing", () => {
    render(
      <JsonFormsFields
        errors={null}
        formData={{ title: "Saved title" }}
        schema={schema}
        uiSchema={uiSchema}
        isFormLocked
        print
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Saved title")).toBeInTheDocument();
  });
});
