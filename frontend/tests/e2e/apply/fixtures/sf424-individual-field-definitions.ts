import { FormFillFieldDefinitions } from "tests/e2e/utils/common/types";
import { FORM_DEFAULTS } from "tests/e2e/utils/forms/form-defaults";
import { FieldError } from "tests/e2e/utils/forms/verify-form-errors-utils";

export const SF424_INDIVIDUAL_FORM_MATCHER =
  /Application for Federal Domestic Assistance - Individual/i;

const CONTACT = "contacts--point_of_contact";
const ADDRESS = `${CONTACT}--address`;
const CITIZENSHIP = "applicant--person--citizenship";

const text = (testId: string, maxLength?: number) => ({
  testId,
  type: "text" as const,
  field: testId,
  maxLength,
});

const dropdown = (id: string) => ({
  selector: `#${id}`,
  printTestId: id,
  type: "dropdown" as const,
  field: id,
});

// maxLength values sourced from:
// api/src/form_schema/forms/sf424_individual_generated/1/0/json_schema.json
export const fieldDefinitionsSF424Individual: FormFillFieldDefinitions = {
  prefix: text(`${CONTACT}--name--prefix`, 10),
  firstName: text(`${CONTACT}--name--first_name`, 35),
  middleName: text(`${CONTACT}--name--middle_name`, 25),
  lastName: text(`${CONTACT}--name--last_name`, 60),
  suffix: text(`${CONTACT}--name--suffix`, 10),
  phone: text(`${CONTACT}--phone`, 25),
  eveningPhone: text(`${CONTACT}--evening_phone`, 25),
  fax: text(`${CONTACT}--fax`, 25),
  email: {
    testId: `${CONTACT}--email`,
    type: "email",
    maxLength: 60,
    field: `${CONTACT}--email`,
  },
  street1: text(`${ADDRESS}--street1`, 55),
  street2: text(`${ADDRESS}--street2`, 55),
  city: text(`${ADDRESS}--city`, 35),
  county: text(`${ADDRESS}--county`, 30),
  state: dropdown(`${ADDRESS}--state`),
  country: dropdown(`${ADDRESS}--country`),
  zipCode: text(`${ADDRESS}--zip_code`, 30),
  // The yes/no question renders one radio per answer, named by the field. A configured
  // selector wins over the fill value, so the definition names the answer to click.
  // Answer No, so the happy path also fills the questions for a non-citizen.
  isUsCitizen: {
    selector: `input[name="${CITIZENSHIP}--is_us_citizen"][value="false"]`,
    printTestId: `${CITIZENSHIP}--is_us_citizen`,
    type: "radiobutton",
    field: `${CITIZENSHIP}--is_us_citizen`,
  },
  alienRegistrationNumber: text(
    `${CITIZENSHIP}--alien_registration_number`,
    14,
  ),
  citizenshipCountry: dropdown(`${CITIZENSHIP}--country`),
  residencyStartDate: text(`${CITIZENSHIP}--residency_start_date`),
  congressionalDistrict: text("applicant--congressional_district", 6),
  projectTitle: text("project--title", 200),
  projectDescription: {
    selector: "#project--description",
    printTestId: "project--description",
    type: "textarea",
    maxLength: 1000,
    field: "project--description",
  },
  startDate: text("project--timeline--start_date"),
  endDate: text("project--timeline--end_date"),
  agree: {
    selector: 'input[name="certification--agree"]',
    type: "checkbox",
    field: "certification--agree",
  },
};

export const SF424_INDIVIDUAL_FORM_CONFIG = {
  ...FORM_DEFAULTS,
  formName: "Application for Federal Domestic Assistance - Individual",
  fields: fieldDefinitionsSF424Individual,
} as const;

const required = (fieldId: string, message: string): FieldError => ({
  fieldId,
  message: `${message} is required`,
});

// An empty save leaves out every section the applicant fills, so each error comes from
// a missing section. A field whose parent has a title (Name, Address, Certification)
// gets that title first. A field's layout label replaces its JSON Schema title.
export const SF424_INDIVIDUAL_REQUIRED_FIELD_ERRORS: FieldError[] = [
  required(`${CONTACT}--name--first_name`, "Name First Name"),
  required(`${CONTACT}--name--last_name`, "Name Last Name"),
  required(`${CONTACT}--phone`, "Telephone Number (Daytime)"),
  required(`${CONTACT}--email`, "Email"),
  required(`${ADDRESS}--street1`, "Address Street 1"),
  required(`${ADDRESS}--city`, "Address City"),
  required(`${ADDRESS}--country`, "Address Country"),
  required(`${CITIZENSHIP}--is_us_citizen`, "U.S. Citizenship"),
  required(
    "applicant--congressional_district",
    "5d. Congressional District of Applicant",
  ),
  required("project--title", "6a. Project Title"),
  required("project--description", "6b. Project Description"),
  required("project--timeline--start_date", "Start Date"),
  required("project--timeline--end_date", "End Date"),
  required("certification--agree", "Certification I Agree"),
];
