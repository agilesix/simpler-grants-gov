import type { ControlElement, Layout, UISchemaElement } from "@jsonforms/core";
import { RJSFSchema } from "@rjsf/utils";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { Attachment } from "src/types/attachmentTypes";
import {
  processFormSchema,
  shapeFormData,
} from "src/utils/applyForm/applyFormUtils";

import { JsonFormsFields } from "src/components/apply-form/jsonforms/JsonFormsFields";
import rrSchemaJson from "./fixtures/rrKeyPersonExpanded.schema.json";
import rrUiJson from "./fixtures/rrKeyPersonExpanded.ui.json";

/*
  The R&R Senior/Key Person Profile (Expanded) as the form library generates it, with the
  JSON schema's $refs inlined as the API serves it. Each senior/key person is a list entry
  whose layout carries two rules: Other Project Role Category is enabled for two roles, and
  Province shows for a non-US address.
*/
const rrSchema = processFormSchema(
  rrSchemaJson as unknown as RJSFSchema,
).formSchema;
const rrUi = rrUiJson as unknown as Layout;

const attachment = (id: string, fileName: string): Attachment => ({
  application_attachment_id: id,
  file_name: fileName,
  download_path: `/download/${id}`,
  file_size_bytes: 1,
  mime_type: "application/pdf",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
});

jest.mock("src/hooks/ApplicationAttachments", () => ({
  useApplicationAttachments: () => ({
    attachments: [attachment("uuid-1", "sketch-1.pdf")],
  }),
}));
jest.mock("src/hooks/useClientFetch", () => ({
  useClientFetch: () => ({ clientFetch: jest.fn() }),
}));
jest.mock("next/navigation", () => ({
  useParams: () => ({ applicationId: "app-123" }),
}));

type FileInputProps = { id: string; onStart?: () => void };
const fileInputs: Record<string, FileInputProps> = {};
jest.mock("src/components/core/fileInput/SimplerFileInput", () => ({
  SimplerFileInput: (props: FileInputProps) => {
    fileInputs[props.id] = props;
    return <div data-testid={`file-input-${props.id}`} />;
  },
}));

const person = (role: string, country: string) => ({
  name: { first_name: role, last_name: "Person" },
  project_role: role,
  email: "person@example.com",
  phone: "1234567890",
  address: { street1: "1 Main", city: "Town", country, zip_code: "20001" },
});

const formData = {
  principal_investigator: person("PD/PI", "USA: UNITED STATES"),
  senior_key_persons: [
    person("Other (Specify)", "CAN: CANADA"),
    person("Faculty", "USA: UNITED STATES"),
  ],
};

const renderForm = (uiSchema: UISchemaElement = rrUi) =>
  render(
    <form data-testid="the-form">
      <JsonFormsFields
        errors={null}
        formData={formData}
        schema={rrSchema}
        uiSchema={uiSchema}
        formContext={
          {
            rootSchema: rrSchema,
            rootFormData: {},
            widgetSupport: {
              markFormDirty: jest.fn(),
              attachmentsUploadingCounter: {
                incrementAttachmentsProcessing: mockIncrement,
                decrementAttachmentsProcessing: jest.fn(),
              },
            },
          } as Parameters<typeof JsonFormsFields>[0]["formContext"]
        }
      />
    </form>,
  );

const mockIncrement = jest.fn();

const entries = () =>
  Array.from(
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelectorAll<HTMLElement>(".field-list-widget__entry"),
  );

/** The senior/key person list control, whose detail lays out one person. */
const seniorKeyPersons = (uiSchema: Layout): ControlElement =>
  (uiSchema.elements[1] as Layout).elements[0] as ControlElement;

describe("R&R Senior/Key Person Profile (Expanded) on JSON Forms", () => {
  it("applies the role and country rules inside each person's entry", () => {
    renderForm();

    expect(
      screen.getByTestId("senior_key_persons[0]--other_project_role_category"),
    ).toBeEnabled();
    expect(
      screen.getByTestId("senior_key_persons[1]--other_project_role_category"),
    ).toBeDisabled();
    expect(
      screen.getByTestId("senior_key_persons[0]--address--province"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("senior_key_persons[1]--address--province"),
    ).not.toBeInTheDocument();
  });

  it("re-applies a rule inside an entry as that person's answer changes", () => {
    renderForm();

    const role = within(entries()[1]).getByRole("combobox", {
      name: /Project Role/,
    });
    fireEvent.change(role, { target: { value: "Other Professional" } });

    expect(
      screen.getByTestId("senior_key_persons[1]--other_project_role_category"),
    ).toBeEnabled();
  });

  it("renders a labeled group inside an entry as a sub-section of the entry", () => {
    const uiSchema = JSON.parse(JSON.stringify(rrUi)) as Layout;
    const detail = seniorKeyPersons(uiSchema).options?.detail as Layout;
    const isAddress = (element: UISchemaElement) =>
      (element as ControlElement).scope.startsWith("#/properties/address/");
    detail.elements = [
      ...detail.elements.filter((element) => !isAddress(element)),
      {
        type: "Group",
        label: "Contact Information",
        elements: detail.elements.filter(isAddress),
      },
    ];

    renderForm(uiSchema);

    const [first, second] = entries();
    const contact = within(first).getByRole("group", {
      name: "Contact Information",
    });
    expect(
      within(contact).getByTestId("senior_key_persons[0]--address--city"),
    ).toHaveValue("Town");
    expect(
      within(contact).getByTestId("senior_key_persons[0]--address--province"),
    ).toBeInTheDocument();
    expect(
      within(second).getByRole("group", { name: "Contact Information" }),
    ).toBeInTheDocument();
  });

  it("saves each person's answers under their entry", () => {
    renderForm();

    const shaped = shapeFormData<{
      senior_key_persons: { project_role: string; address: object }[];
    }>(new FormData(screen.getByTestId<HTMLFormElement>("the-form")), rrSchema);
    expect(shaped.senior_key_persons.map((p) => p.project_role)).toEqual([
      "Other (Specify)",
      "Faculty",
    ]);
  });

  it("counts an upload inside an entry, so Save waits for it", () => {
    renderForm();
    mockIncrement.mockClear();

    act(() =>
      fileInputs[
        "senior_key_persons[0]--biographical_sketch-visible"
      ].onStart?.(),
    );

    expect(mockIncrement).toHaveBeenCalledTimes(1);
  });
});
