import {
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
  type UISchemaElement,
} from "@jsonforms/core";
import { RJSFSchema } from "@rjsf/utils";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  buildWarningTree,
  shapeFormData,
} from "src/utils/applyForm/applyFormUtils";

import { convertJsonFormsUiSchema } from "src/components/apply-form/jsonforms/convertUiSchema";
import { JsonFormsFields } from "src/components/apply-form/jsonforms/JsonFormsFields";

jest.mock("src/utils/applyForm/applyFormUtils", () => {
  const actual = jest.requireActual<
    typeof import("src/utils/applyForm/applyFormUtils")
  >("src/utils/applyForm/applyFormUtils");
  return { ...actual, shapeFormData: jest.fn(actual.shapeFormData) };
});

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
  it("renders each control with the widget and field name the SGG renderer would use", () => {
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

  it("rebuilds the rule data once per keystroke", () => {
    renderFields();
    jest.mocked(shapeFormData).mockClear();

    fireEvent.input(screen.getByTestId("has_partner"), {
      target: { value: "y" },
    });

    expect(shapeFormData).toHaveBeenCalledTimes(1);
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

  it("skips a control a widget can't render", () => {
    const nestedListSchema: RJSFSchema = {
      type: "object",
      properties: {
        title: { type: "string", title: "Project Title" },
        budget: {
          type: "object",
          properties: {
            line_items: {
              type: "array",
              items: {
                type: "object",
                properties: { amount: { type: "string" } },
              },
            },
          },
        },
      },
    };
    render(
      <JsonFormsFields
        errors={null}
        formData={{}}
        schema={nestedListSchema}
        uiSchema={{
          type: "VerticalLayout",
          elements: [
            { type: "Control", scope: "#/properties/title" },
            {
              type: "Control",
              scope: "#/properties/budget/properties/line_items",
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId("title")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(screen.queryByText(/No applicable/)).not.toBeInTheDocument();
  });

  it("renders an element with an extra renderer ranked above the SGG ones", () => {
    const groups: JsonFormsRendererRegistryEntry[] = [
      {
        tester: rankWith(20, uiTypeIs("Group")),
        renderer: () => <p>Extra group</p>,
      },
    ];
    render(
      <form>
        <JsonFormsFields
          errors={null}
          formData={{}}
          schema={schema}
          uiSchema={uiSchema}
          extraRenderers={groups}
        />
      </form>,
    );

    expect(screen.getByText("Extra group")).toBeInTheDocument();
    expect(screen.queryByTestId("title")).not.toBeInTheDocument();
  });
});

describe("JsonFormsFields lists", () => {
  const listSchema: RJSFSchema = {
    type: "object",
    properties: {
      people: {
        type: "array",
        title: "People",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", title: "Name", maxLength: 60 },
            role: { type: "string", title: "Role", maxLength: 20 },
            other_role: { type: "string", title: "Other Role", maxLength: 60 },
            address: {
              type: "object",
              properties: {
                city: { type: "string", title: "City", maxLength: 60 },
              },
            },
            phones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  number: { type: "string", title: "Number", maxLength: 20 },
                },
              },
            },
          },
        },
      },
    },
  };

  const listUiSchema = {
    type: "VerticalLayout",
    elements: [
      {
        type: "Control",
        scope: "#/properties/people",
        label: "Person",
        options: {
          detail: {
            type: "VerticalLayout",
            elements: [
              { type: "Control", scope: "#/properties/name" },
              { type: "Control", scope: "#/properties/role" },
              {
                type: "Control",
                scope: "#/properties/other_role",
                rule: {
                  effect: "ENABLE",
                  condition: {
                    scope: "#/properties/role",
                    schema: { const: "Other" },
                  },
                },
              },
              {
                type: "Group",
                label: "Address",
                elements: [
                  {
                    type: "Control",
                    scope: "#/properties/address/properties/city",
                  },
                ],
              },
              {
                type: "Control",
                scope: "#/properties/phones",
                label: "Phone",
                options: {
                  detail: {
                    type: "VerticalLayout",
                    elements: [
                      { type: "Control", scope: "#/properties/number" },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    ],
  } as UISchemaElement;

  const savedPeople = {
    people: [
      {
        name: "Ada",
        role: "Other",
        other_role: "Advisor",
        address: { city: "Boston" },
        phones: [{ number: "111" }, { number: "222" }],
      },
      { name: "Ben", role: "PI" },
    ],
  };

  const renderList = (
    props: Partial<Parameters<typeof JsonFormsFields>[0]> = {},
  ) =>
    render(
      <form data-testid="the-form">
        <JsonFormsFields
          errors={null}
          formData={savedPeople}
          schema={listSchema}
          uiSchema={listUiSchema}
          {...props}
        />
      </form>,
    );

  const entries = () =>
    // eslint-disable-next-line testing-library/no-node-access
    Array.from(document.querySelectorAll(".field-list-widget__entry")).filter(
      // eslint-disable-next-line testing-library/no-node-access
      (entry) => !entry.parentElement?.closest(".field-list-widget__entry"),
    ) as HTMLElement[];

  it("renders each entry under the field list's heading, with fields named by entry", () => {
    renderList();

    expect(
      screen.getByRole("heading", { name: "Person 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Person 2" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("people[0]--name")).toHaveValue("Ada");
    expect(screen.getByTestId("people[0]--name")).toHaveAttribute(
      "name",
      "people[0]--name",
    );
    expect(screen.getByTestId("people[0]--name")).toBeRequired();
    expect(screen.getByTestId("people[1]--name")).toHaveValue("Ben");
    expect(screen.getByTestId("people[0]--address--city")).toHaveValue(
      "Boston",
    );
  });

  it("applies a rule inside an entry against that entry's answers", () => {
    renderList();

    expect(screen.getByTestId("people[0]--other_role")).toBeEnabled();
    expect(screen.getByTestId("people[1]--other_role")).toBeDisabled();

    const role = screen.getByTestId("people[1]--role");
    fireEvent.change(role, { target: { value: "Other" } });
    fireEvent.input(role, { target: { value: "Other" } });

    expect(screen.getByTestId("people[1]--other_role")).toBeEnabled();
    expect(screen.getByTestId("people[0]--other_role")).toBeEnabled();
  });

  it("re-applies the rules to the entries that move up when an entry is removed", async () => {
    renderList();
    expect(screen.getByTestId("people[0]--other_role")).toBeEnabled();

    fireEvent.click(
      within(entries()[0]).getAllByRole("button", { name: /deleteEntry/ })[2],
    );

    await waitFor(() =>
      expect(screen.getByTestId("people[0]--name")).toHaveValue("Ben"),
    );
    await waitFor(() =>
      expect(screen.getByTestId("people[0]--other_role")).toBeDisabled(),
    );
  });

  it("renders a labeled group inside an entry as a sub-section of each entry", () => {
    renderList();

    const [first, second] = entries();
    const firstAddress = within(first).getByRole("group", { name: "Address" });
    expect(
      within(firstAddress).getByTestId("people[0]--address--city"),
    ).toBeInTheDocument();
    expect(
      within(second).getByRole("group", { name: "Address" }),
    ).toBeInTheDocument();
    expect(firstAddress).not.toHaveAttribute("id");
  });

  it("renders a list inside an entry as a list, which saves as a nested array", () => {
    renderList();

    const [first] = entries();
    expect(
      within(first).getByRole("heading", { name: "Phone 2" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("people[0]--phones[1]--number")).toHaveValue(
      "222",
    );

    fireEvent.click(
      within(first).getAllByRole("button", { name: /addEntry/ })[0],
    );
    fireEvent.change(screen.getByTestId("people[0]--phones[2]--number"), {
      target: { value: "333" },
    });

    expect(
      shapeFormData(
        new FormData(screen.getByTestId<HTMLFormElement>("the-form")),
        listSchema,
      ),
    ).toEqual({
      people: [
        {
          name: "Ada",
          role: "Other",
          other_role: "Advisor",
          address: { city: "Boston" },
          phones: [{ number: "111" }, { number: "222" }, { number: "333" }],
        },
        { name: "Ben", role: "PI" },
      ],
    });
  });

  it("shows a warning on the entry's field it names, at any list depth", () => {
    const { uiSchema } = convertJsonFormsUiSchema(listUiSchema, listSchema);
    const errors = buildWarningTree(
      uiSchema,
      null,
      [
        {
          field: "$.people[1].name",
          message: "Name is too long",
          type: "maxLength",
          value: null,
        },
        {
          field: "$.people[0].phones[1].number",
          message: "Number is too long",
          type: "maxLength",
          value: null,
        },
      ],
      listSchema,
    );
    expect(errors.map((error) => error.htmlField)).toEqual([
      "people[1]--name",
      "people[0]--phones[1]--number",
    ]);

    renderList({ errors });

    const [first, second] = entries();
    expect(within(second).getByText("Name is too long")).toBeInTheDocument();
    expect(
      within(first).queryByText("Name is too long"),
    ).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-node-access
    const phoneEntries = first.querySelectorAll(".field-list-widget__entry");
    expect(
      within(phoneEntries[1] as HTMLElement).getByText("Number is too long"),
    ).toBeInTheDocument();
    expect(
      within(phoneEntries[0] as HTMLElement).queryByText("Number is too long"),
    ).not.toBeInTheDocument();
  });

  it("prints each entry's answers", () => {
    render(
      <JsonFormsFields
        errors={null}
        formData={savedPeople}
        schema={listSchema}
        uiSchema={listUiSchema}
        isFormLocked
        print
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Boston")).toBeInTheDocument();
    expect(screen.getByText("222")).toBeInTheDocument();
  });
});
