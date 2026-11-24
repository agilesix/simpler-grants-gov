import type {
  FillFieldDefinition,
  FormFillFieldDefinitions,
} from "tests/e2e/utils/common/types";
import { FORM_DEFAULTS } from "tests/e2e/utils/forms/form-defaults";
import type { FieldError } from "tests/e2e/utils/forms/verify-form-errors-utils";

// The SF424 Mandatory Form generated from forms/specs. Field ids follow the answer's path,
// e.g. applicant--organization--address--city.

export const SF424_MANDATORY_FORM_MATCHER = /SF424 Mandatory Form/i;

const STATE_REVIEW_QUESTION =
  "Is Submission Subject to Review by State Under Executive Order 12372 Process?";
const DELINQUENT_DEBT_QUESTION =
  "Is the Applicant Delinquent on Any Federal Debt?";

const text = (testId: string, maxLength?: number): FillFieldDefinition => ({
  testId,
  type: "text",
  field: testId,
  maxLength,
});

// A textarea's test id is "textarea", so find it by its field id.
const textArea = (id: string, maxLength: number): FillFieldDefinition => ({
  selector: `[id="${id}"]`,
  printTestId: id,
  type: "textarea",
  field: id,
  maxLength,
});

const dropdown = (id: string): FillFieldDefinition => ({
  selector: `[id="${id}"]`,
  printTestId: id,
  type: "dropdown",
  field: id,
});

// Each yes/no question renders one radio per answer, named by the field. A configured
// selector wins over the fill value, so the definition names the answer to click.
const yesNo = (id: string, answer: boolean): FillFieldDefinition => ({
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

// Ask a follow-up only after the answer that requires it.
const after = (
  definition: FillFieldDefinition,
  field: string,
  value: string,
): FillFieldDefinition => ({ ...definition, dependsOn: { field, value } });

/** A person's name, title, organization, and contact details, by path below the person. */
const personFields = (person: string): FormFillFieldDefinitions => ({
  [`${person}--name--prefix`]: text(`${person}--name--prefix`, 10),
  [`${person}--name--first_name`]: text(`${person}--name--first_name`, 35),
  [`${person}--name--middle_name`]: text(`${person}--name--middle_name`, 25),
  [`${person}--name--last_name`]: text(`${person}--name--last_name`, 60),
  [`${person}--name--suffix`]: text(`${person}--name--suffix`, 10),
  [`${person}--title`]: text(`${person}--title`, 45),
  [`${person}--organization--name`]: text(`${person}--organization--name`, 60),
  [`${person}--phone`]: text(`${person}--phone`, 25),
  [`${person}--fax`]: text(`${person}--fax`, 25),
  [`${person}--email`]: text(`${person}--email`, 60),
});

// maxLength values sourced from:
// api/src/form_schema/forms/sf424_mandatory_generated/1/0/json_schema.json
export const fieldDefinitionsSF424Mandatory: FormFillFieldDefinitions = {
  "application--submission_type": dropdown("application--submission_type"),
  "application--submission_type_other": after(
    textArea("application--submission_type_other", 50),
    "application--submission_type",
    "Other",
  ),
  "application--frequency--code": dropdown("application--frequency--code"),
  "application--frequency--other": after(
    textArea("application--frequency--other", 50),
    "application--frequency--code",
    "Other",
  ),
  "application--consolidated_request--answer": yesNo(
    "application--consolidated_request--answer",
    false,
  ),
  "application--version": dropdown("application--version"),
  "application--state--received_date": text(
    "application--state--received_date",
  ),
  "application--applicant_id": text("application--applicant_id", 30),
  "application--federal_entity_identifier": text(
    "application--federal_entity_identifier",
    30,
  ),
  "application--federal_award_identifier": text(
    "application--federal_award_identifier",
    25,
  ),
  "application--state--application_id": text(
    "application--state--application_id",
    30,
  ),
  "applicant--organization--name": text("applicant--organization--name", 60),
  "applicant--organization--ein": text("applicant--organization--ein", 30),
  "applicant--organization--address--street1": text(
    "applicant--organization--address--street1",
    55,
  ),
  "applicant--organization--address--street2": text(
    "applicant--organization--address--street2",
    55,
  ),
  "applicant--organization--address--city": text(
    "applicant--organization--address--city",
    35,
  ),
  "applicant--organization--address--county": text(
    "applicant--organization--address--county",
    30,
  ),
  "applicant--organization--address--state": dropdown(
    "applicant--organization--address--state",
  ),
  "applicant--organization--address--country": dropdown(
    "applicant--organization--address--country",
  ),
  "applicant--organization--address--zip_code": text(
    "applicant--organization--address--zip_code",
    30,
  ),
  "applicant--organization--department": text(
    "applicant--organization--department",
    30,
  ),
  "applicant--organization--division": text(
    "applicant--organization--division",
    30,
  ),
  "applicant--type--code": dropdown("applicant--type--code"),
  "applicant--type--other_specify": after(
    text("applicant--type--other_specify", 50),
    "applicant--type--code",
    "X: Other (specify)",
  ),
  "applicant--type--additional_description": textArea(
    "applicant--type--additional_description",
    50,
  ),
  ...personFields("contacts--point_of_contact"),
  "project--title": text("project--title", 250),
  "project--areas_affected": textArea("project--areas_affected", 250),
  "applicant--congressional_district": text(
    "applicant--congressional_district",
    6,
  ),
  "project--congressional_district": text("project--congressional_district", 6),
  "project--additional_congressional_districts": file(
    "project--additional_congressional_districts",
  ),
  "budget--funding_period--start_date": text(
    "budget--funding_period--start_date",
  ),
  "budget--funding_period--end_date": text("budget--funding_period--end_date"),
  "budget--funding_sources--federal": text(
    "budget--funding_sources--federal",
    15,
  ),
  "budget--funding_sources--match": text("budget--funding_sources--match", 15),
  "application--state_review--status": dropdown(
    "application--state_review--status",
  ),
  "application--state_review--date": after(
    text("application--state_review--date"),
    "application--state_review--status",
    "StateReviewAvailable",
  ),
  "applicant--delinquent_federal_debt--answer": yesNo(
    "applicant--delinquent_federal_debt--answer",
    false,
  ),
  // Find the agreement by its input: the checkbox has no test id.
  "certification--agree": {
    selector: 'input[name="certification--agree"]',
    type: "checkbox",
    field: "certification--agree",
  },
  ...personFields("contacts--authorized_representative"),
  "attachments--additional": file("attachments--additional"),
};

export const SF424_MANDATORY_FORM_CONFIG = {
  ...FORM_DEFAULTS,
  formName: "SF424 Mandatory Form",
  fields: fieldDefinitionsSF424Mandatory,
} as const;

// The validation summary drops a title's "?" and apostrophes before "is required", and puts
// the title of a missing group in front, e.g. "Address City is required".
const required = (fieldId: string, title: string): FieldError => ({
  fieldId,
  message: `${title.replace("?", "").replace(/'/g, "")} is required`,
});

const personRequiredErrors = (person: string): FieldError[] => [
  required(`${person}--name--first_name`, "Name First Name"),
  required(`${person}--name--last_name`, "Name Last Name"),
];

// An empty save leaves out every unanswered group, so each required field below it is
// reported. The agency, assistance listing, and UEI are pre-populated, so they're not.
export const SF424_MANDATORY_REQUIRED_FIELD_ERRORS: FieldError[] = [
  required("application--submission_type", "1a. Type of Submission"),
  required("application--frequency--code", "1b. Frequency"),
  required("application--version", "1d. Version"),
  required("applicant--organization--name", "7a. Legal Name"),
  required(
    "applicant--organization--ein",
    "7b. Employer/Taxpayer Identification Number (EIN/TIN)",
  ),
  required("applicant--organization--address--street1", "Address Street 1"),
  required("applicant--organization--address--city", "Address City"),
  required("applicant--organization--address--country", "Address Country"),
  required("applicant--type--code", "8a. Type of Applicant"),
  ...personRequiredErrors("contacts--point_of_contact"),
  required("contacts--point_of_contact--phone", "Phone Number"),
  required("contacts--point_of_contact--email", "Email"),
  required("project--title", "Descriptive Title of Applicant's Project"),
  required("applicant--congressional_district", "13a. Applicant"),
  required("budget--funding_period--start_date", "14a. Start Date"),
  required("budget--funding_period--end_date", "14b. End Date"),
  required("budget--funding_sources--federal", "15a. Federal"),
  required("application--state_review--status", STATE_REVIEW_QUESTION),
  required(
    "applicant--delinquent_federal_debt--answer",
    DELINQUENT_DEBT_QUESTION,
  ),
  required("certification--agree", "Certification I Agree"),
  ...personRequiredErrors("contacts--authorized_representative"),
  required("contacts--authorized_representative--title", "Title"),
  required("contacts--authorized_representative--phone", "Phone Number"),
  required("contacts--authorized_representative--email", "Email"),
];
