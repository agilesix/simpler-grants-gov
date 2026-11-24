import {
  FillFieldDefinition,
  FormFillFieldDefinitions,
} from "tests/e2e/utils/common/types";
import { FORM_DEFAULTS } from "tests/e2e/utils/forms/form-defaults";
import { FieldError } from "tests/e2e/utils/forms/verify-form-errors-utils";

// The SF-424 (R&R) generated from forms/specs. Skip the SF-424 family's other forms.
export const SF424_R_R_FORM_MATCHER =
  /Application for Federal Assistance \(SF 424 R&R\)/i;

// The answers the happy path picks for each radio. A configured selector wins over the fill
// value, so each radio definition names the answer to click and the data repeats it for
// the print view.
export const SF424_R_R_RADIO_ANSWERS = {
  submissionType: "Application",
  applicationType: "New",
  stateReviewStatus: "Program is not covered by E.O. 12372",
} as const;

const text = (testId: string): FillFieldDefinition => ({
  testId,
  type: "text",
  field: testId,
});

// Selects render with a shared test ID, so target each by its id.
const dropdown = (id: string): FillFieldDefinition => ({
  selector: `[id="${id}"]`,
  printTestId: id,
  type: "dropdown",
  field: id,
});

// Each radio renders one input per answer, named by the field.
const radio = (id: string, answer: string): FillFieldDefinition => ({
  selector: `input[name="${id}"][value="${answer}"]`,
  printTestId: id,
  type: "radiobutton",
  field: id,
});

const file = (id: string): FillFieldDefinition => ({
  selector: `input[name="${id}-visible"][type="file"]`,
  type: "file",
  field: id,
});

const addressFields = (prefix: string): FormFillFieldDefinitions => ({
  [`${prefix}--address--street1`]: text(`${prefix}--address--street1`),
  [`${prefix}--address--street2`]: text(`${prefix}--address--street2`),
  [`${prefix}--address--city`]: text(`${prefix}--address--city`),
  [`${prefix}--address--county`]: text(`${prefix}--address--county`),
  [`${prefix}--address--state`]: dropdown(`${prefix}--address--state`),
  [`${prefix}--address--country`]: dropdown(`${prefix}--address--country`),
  [`${prefix}--address--zip_code`]: text(`${prefix}--address--zip_code`),
});

// A contact's questions, keyed by test ID. The PD/PI and AOR also name their organization.
const contactFields = (
  prefix: string,
  withOrganization: boolean,
): FormFillFieldDefinitions => {
  const answer = (field: string) => ({
    [`${prefix}--${field}`]: text(`${prefix}--${field}`),
  });
  return {
    ...answer("name--prefix"),
    ...answer("name--first_name"),
    ...answer("name--middle_name"),
    ...answer("name--last_name"),
    ...answer("name--suffix"),
    ...answer("title"),
    ...(withOrganization
      ? {
          ...answer("organization--name"),
          ...answer("organization--department"),
          ...answer("organization--division"),
        }
      : {}),
    ...addressFields(prefix),
    ...answer("phone"),
    ...answer("fax"),
    ...answer("email"),
  };
};

// maxLength values sourced from:
// api/src/form_schema/forms/sf424_r_r_generated/1/0/json_schema.json
export const fieldDefinitionsSF424RR: FormFillFieldDefinitions = {
  "application--submission_type": radio(
    "application--submission_type",
    SF424_R_R_RADIO_ANSWERS.submissionType,
  ),
  "application--date_submitted": text("application--date_submitted"),
  "application--applicant_id": text("application--applicant_id"),
  "application--state--received_date": text(
    "application--state--received_date",
  ),
  "application--state--application_id": text(
    "application--state--application_id",
  ),
  "application--federal_identifier": text("application--federal_identifier"),
  "application--agency_routing_number": text(
    "application--agency_routing_number",
  ),
  "application--previous_tracking_id": {
    ...text("application--previous_tracking_id"),
    dependsOn: {
      field: "application--submission_type",
      value: "Change/Corrected Application",
    },
  },
  "application--application_type": radio(
    "application--application_type",
    SF424_R_R_RADIO_ANSWERS.applicationType,
  ),
  "application--revision--type": {
    ...dropdown("application--revision--type"),
    dependsOn: { field: "application--application_type", value: "Revision" },
  },
  "application--other_agencies--submitted": radio(
    "application--other_agencies--submitted",
    "false",
  ),
  "application--other_agencies--explanation": {
    ...text("application--other_agencies--explanation"),
    dependsOn: {
      field: "application--other_agencies--submitted",
      value: "Yes",
    },
  },
  "applicant--organization--name": text("applicant--organization--name"),
  "applicant--organization--department": text(
    "applicant--organization--department",
  ),
  "applicant--organization--division": text(
    "applicant--organization--division",
  ),
  ...addressFields("applicant--organization"),
  "applicant--organization--ein": text("applicant--organization--ein"),
  ...contactFields("contacts--point_of_contact", false),
  "applicant--type--code": dropdown("applicant--type--code"),
  "applicant--type--other_specify": {
    ...text("applicant--type--other_specify"),
    dependsOn: { field: "applicant--type--code", value: "X: Other (specify)" },
  },
  "project--title": text("project--title"),
  "project--timeline--start_date": text("project--timeline--start_date"),
  "project--timeline--end_date": text("project--timeline--end_date"),
  "applicant--congressional_district": {
    ...text("applicant--congressional_district"),
    maxLength: 6,
  },
  ...contactFields("contacts--project_director", true),
  "budget--funding_sources--federal": text("budget--funding_sources--federal"),
  "budget--funding_sources--non_federal": text(
    "budget--funding_sources--non_federal",
  ),
  "budget--funding_sources--total": text("budget--funding_sources--total"),
  "budget--funding_sources--program_income": text(
    "budget--funding_sources--program_income",
  ),
  "application--state_review--status": radio(
    "application--state_review--status",
    SF424_R_R_RADIO_ANSWERS.stateReviewStatus,
  ),
  "application--state_review--date": {
    ...text("application--state_review--date"),
    dependsOn: { field: "application--state_review--status", value: "Y: Yes" },
  },
  "certification--agree": {
    selector: '[id="certification--agree"]',
    printTestId: "certification--agree",
    type: "checkbox",
    field: "certification--agree",
  },
  ...contactFields("contacts--authorized_representative", true),
  "attachments--lobbying_disclosure": file("attachments--lobbying_disclosure"),
  "attachments--pre_application": file("attachments--pre_application"),
  "attachments--cover_letter": file("attachments--cover_letter"),
};

export const SF424_R_R_FORM_CONFIG = {
  ...FORM_DEFAULTS,
  formName: "Application for Federal Assistance (SF 424 R&R)",
  fields: fieldDefinitionsSF424RR,
} as const;

const required = (fieldId: string, title: string): FieldError => ({
  fieldId,
  message: `${title.replace("?", "")} is required`,
});

// The frontend drops each empty object an empty save leaves, so the API reports the object
// missing and its fields' errors start with the object's title (e.g. "Address City").
const addressErrors = (prefix: string): FieldError[] => [
  required(`${prefix}--address--street1`, "Address Street 1"),
  required(`${prefix}--address--city`, "Address City"),
  required(`${prefix}--address--country`, "Address Country"),
];

const contactErrors = (
  prefix: string,
  extraFields: Record<string, string>,
): FieldError[] => [
  required(`${prefix}--name--first_name`, "Name First Name"),
  required(`${prefix}--name--last_name`, "Name Last Name"),
  ...Object.entries(extraFields).map(([field, title]) =>
    required(`${prefix}--${field}`, title),
  ),
  ...addressErrors(prefix),
  required(`${prefix}--phone`, "Phone Number"),
];

export const SF424_R_R_REQUIRED_FIELD_ERRORS: FieldError[] = [
  required("application--submission_type", "Type of Submission"),
  required("application--application_type", "Type of Application"),
  required(
    "application--other_agencies--submitted",
    "Is this application being submitted to other agencies?",
  ),
  required(
    "application--state_review--status",
    "Is Application Subject to Review by State Executive Order 12372 Process?",
  ),
  required("applicant--organization--name", "Legal Name"),
  ...addressErrors("applicant--organization"),
  required(
    "applicant--organization--ein",
    "Employer Identification (EIN) or (TIN)",
  ),
  required("applicant--type--code", "Type of Applicant"),
  required(
    "applicant--congressional_district",
    "Congressional District of Applicant",
  ),
  required("project--title", "Descriptive Title of Applicants Project"),
  required("project--timeline--start_date", "Start Date"),
  required("project--timeline--end_date", "Ending Date"),
  ...contactErrors("contacts--point_of_contact", {}),
  ...contactErrors("contacts--project_director", {
    "organization--name": "Organization Name",
  }),
  required("contacts--project_director--email", "Email"),
  ...contactErrors("contacts--authorized_representative", {
    title: "Title",
    "organization--name": "Organization Name",
  }),
  required("contacts--authorized_representative--email", "Email"),
  required(
    "budget--funding_sources--federal",
    "15a. Total Federal Funds Requested",
  ),
  required(
    "budget--funding_sources--non_federal",
    "15b. Total Non-Federal Funds",
  ),
  required(
    "budget--funding_sources--total",
    "15c. Total Federal & Non-Federal Funds",
  ),
  required(
    "budget--funding_sources--program_income",
    "15d. Estimated Program Income",
  ),
  required("certification--agree", "Certification I agree"),
];
