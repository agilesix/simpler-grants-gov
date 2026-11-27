import type { fieldDefinitionsSF424 } from "tests/e2e/apply/fixtures/sf424-field-definitions";
import {
  FillFieldDefinition,
  FormFillFieldDefinitions,
} from "tests/e2e/utils/common/types";
import { FORM_DEFAULTS } from "tests/e2e/utils/forms/form-defaults";
import { FieldError } from "tests/e2e/utils/forms/verify-form-errors-utils";

// The SF-424 generated from forms/specs. It nests each answer under its section, so its
// field ids differ from the hand-written form's. Each definition keeps the hand-written
// key, so both forms fill from the same test data.

const STATE_REVIEW_A =
  "a. This application was made available to the State under the Executive Order 12372 Process for review on";

const text = (testId: string, maxLength: number): FillFieldDefinition => ({
  testId,
  type: "text",
  maxLength,
  field: testId,
});

// A radio group renders one input per answer, named by the field. A configured selector
// wins over the fill value, so the definition names the answer to click.
const radio = (id: string, value: string): FillFieldDefinition => ({
  selector: `input[name="${id}"][value="${value}"]`,
  printTestId: id,
  type: "radiobutton",
  field: id,
});

const dropdown = (id: string): FillFieldDefinition => ({
  selector: `#${id}`,
  printTestId: id,
  type: "dropdown",
  field: id,
});

const file = (id: string) => ({
  selector: `input[name="${id}-visible"][type="file"]`,
  type: "file" as const,
  field: id,
});

// maxLength values sourced from:
// api/src/form_schema/forms/sf424_generated/1/0/json_schema.json
export const fieldDefinitionsSF424Generated = {
  submission_type: radio("application--submission_type", "Application"),
  application_type: radio("application--application_type", "New"),
  revision_type: {
    ...dropdown("application--revision--type"),
    dependsOn: { field: "application_type", value: "Revision" },
  },
  revision_other_specify: {
    ...text("application--revision--other_specify", 21),
    dependsOn: { field: "revision_type", value: "E: Other (specify)" },
  },
  applicant_id: text("application--applicant_id", 30),
  federal_entity_identifier: text("application--federal_entity_identifier", 30),
  federal_award_identifier: text("application--federal_award_identifier", 25),
  organization_name: text("applicant--organization--name", 60),
  employer_taxpayer_identification_number: text(
    "applicant--organization--ein",
    30,
  ),
  applicant_street1: text("applicant--organization--address--street1", 55),
  applicant_street2: text("applicant--organization--address--street2", 55),
  applicant_city: text("applicant--organization--address--city", 35),
  applicant_state: dropdown("applicant--organization--address--state"),
  applicant_country: dropdown("applicant--organization--address--country"),
  applicant_zip_code: text("applicant--organization--address--zip_code", 30),
  department_name: text("applicant--organization--department", 30),
  division_name: text("applicant--organization--division", 30),
  contact_person_prefix: text("contacts--point_of_contact--name--prefix", 10),
  contact_person_first_name: text(
    "contacts--point_of_contact--name--first_name",
    35,
  ),
  contact_person_middle_name: text(
    "contacts--point_of_contact--name--middle_name",
    25,
  ),
  contact_person_last_name: text(
    "contacts--point_of_contact--name--last_name",
    60,
  ),
  contact_person_suffix: text("contacts--point_of_contact--name--suffix", 10),
  contact_person_title: text("contacts--point_of_contact--title", 45),
  organization_affiliation: text(
    "contacts--point_of_contact--organization--name",
    60,
  ),
  phone_number: text("contacts--point_of_contact--phone", 25),
  fax: text("contacts--point_of_contact--fax", 25),
  email: text("contacts--point_of_contact--email", 60),
  applicant_type_code__combobox: {
    testId: "combo-box-toggle",
    printTestId: "applicant--type--codes",
    optionTestIdPrefix: "combo-box-option-",
    type: "combo-box-input",
    field: "Type of Applicant",
  },
  applicant_type_other_specify: text("applicant--type--other_specify", 30),
  areas_affected_attachment: file("project--areas_affected"),
  project_title: text("project--title", 200),
  additional_project_title_attachment: file("project--additional_titles"),
  congressional_district_applicant: text(
    "applicant--congressional_district",
    6,
  ),
  congressional_district_program_project: text(
    "project--congressional_district",
    6,
  ),
  additional_congressional_attachment: file(
    "project--additional_congressional_districts",
  ),
  project_start_date: text("project--timeline--start_date", 10),
  project_end_date: text("project--timeline--end_date", 10),
  federal_estimated_funding: text("budget--funding_sources--federal", 15),
  applicant_estimated_funding: text("budget--funding_sources--applicant", 15),
  state_estimated_funding: text("budget--funding_sources--state", 15),
  local_estimated_funding: text("budget--funding_sources--local", 15),
  other_estimated_funding: text("budget--funding_sources--other", 15),
  program_income_estimated_funding: text(
    "budget--funding_sources--program_income",
    15,
  ),
  application_subject_to: radio(
    "application--state_review--status",
    "c. Program is not covered by E.O. 12372.",
  ),
  // The date is enabled only for answer a.
  state_review_available_date: {
    ...text("application--state_review--date", 10),
    dependsOn: { field: "application_subject_to", value: STATE_REVIEW_A },
  },
  delinquent_federal_debt: radio(
    "applicant--delinquent_federal_debt--answer",
    "false",
  ),
  debt_explanation_attachment: {
    ...file("applicant--delinquent_federal_debt--explanation"),
    dependsOn: { field: "delinquent_federal_debt", value: "Yes" },
  },
  certification_agree: {
    selector: "#certification--agree",
    type: "checkbox",
    field: "certification--agree",
  },
  authorized_representative_prefix: text(
    "contacts--authorized_representative--name--prefix",
    10,
  ),
  authorized_representative_first_name: text(
    "contacts--authorized_representative--name--first_name",
    35,
  ),
  authorized_representative_middle_name: text(
    "contacts--authorized_representative--name--middle_name",
    25,
  ),
  authorized_representative_last_name: text(
    "contacts--authorized_representative--name--last_name",
    60,
  ),
  authorized_representative_suffix: text(
    "contacts--authorized_representative--name--suffix",
    10,
  ),
  authorized_representative_title: text(
    "contacts--authorized_representative--title",
    45,
  ),
  authorized_representative_phone_number: text(
    "contacts--authorized_representative--phone",
    25,
  ),
  authorized_representative_fax: text(
    "contacts--authorized_representative--fax",
    25,
  ),
  authorized_representative_email: text(
    "contacts--authorized_representative--email",
    60,
  ),
} satisfies Partial<
  Record<keyof typeof fieldDefinitionsSF424, FillFieldDefinition>
> satisfies FormFillFieldDefinitions;

export const SF424_GENERATED_FORM_CONFIG = {
  ...FORM_DEFAULTS,
  formName: "Application for Federal Assistance (SF-424)",
  fields: fieldDefinitionsSF424Generated,
} as const;

// The validation summary titles each error with the field's layout label, and an empty
// save leaves out each empty section, so a nested field's error starts with its parent's
// title.
const required = (fieldId: string, title: string): FieldError => ({
  fieldId,
  message: `${title} is required`,
});

export const SF424_GENERATED_REQUIRED_FIELD_ERRORS: FieldError[] = [
  required("application--submission_type", "Type of Submission"),
  required("application--application_type", "Type of Application"),
  required("applicant--organization--name", "8a. Legal Name"),
  required(
    "applicant--organization--ein",
    "8b. Employer/Taxpayer Identification Number (EIN/TIN)",
  ),
  required("applicant--organization--address--street1", "Address Street 1"),
  required("applicant--organization--address--city", "Address City"),
  required("applicant--organization--address--country", "Address Country"),
  required("contacts--point_of_contact--name--first_name", "Name First Name"),
  required("contacts--point_of_contact--name--last_name", "Name Last Name"),
  required("contacts--point_of_contact--phone", "Phone Number"),
  required("contacts--point_of_contact--email", "Email"),
  required("applicant--type--codes", "Type of Applicant"),
  required("project--title", "Descriptive Title of Applicants Project"),
  required("applicant--congressional_district", "16a. Applicant"),
  required("project--congressional_district", "16b. Program/Project"),
  required("project--timeline--start_date", "17a. Start Date"),
  required("project--timeline--end_date", "17b. End Date"),
  required("budget--funding_sources--federal", "18a. Federal"),
  required("budget--funding_sources--applicant", "18b. Applicant"),
  required("budget--funding_sources--state", "18c. State"),
  required("budget--funding_sources--local", "18d. Local"),
  required("budget--funding_sources--other", "18e. Other"),
  required("budget--funding_sources--program_income", "18f. Program Income"),
  required(
    "application--state_review--status",
    "Is Application Subject to Review By State Under Executive Order 12372 Process",
  ),
  required(
    "applicant--delinquent_federal_debt--answer",
    "Is the Applicant Delinquent On Any Federal Debt",
  ),
  required("certification--agree", "Certification I Agree"),
  required(
    "contacts--authorized_representative--name--first_name",
    "Name First Name",
  ),
  required(
    "contacts--authorized_representative--name--last_name",
    "Name Last Name",
  ),
  required("contacts--authorized_representative--title", "Title"),
  required("contacts--authorized_representative--phone", "Phone Number"),
  required("contacts--authorized_representative--email", "Email"),
];
