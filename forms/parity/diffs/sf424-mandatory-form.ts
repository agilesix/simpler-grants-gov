import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import {
  BUDGET_AMOUNT,
  EMAIL_MIN_LENGTH,
  emailMinLength,
  SHARED_HELP,
} from "./common.ts";

const postPopulation: Pinned = {
  plan: "no",
  source: "yes",
  category: "intentional",
  reason:
    "SGG fills this in when the application is submitted, so the applicant doesn't enter it. The XML still requires it.",
};

const radioChoice: Recorded = {
  category: "upstream",
  reason:
    "The DAT lists each choice of a question on its own row. The form asks one question with all of the DAT's choices.",
};

const groupedFields: Recorded = {
  category: "intentional",
  reason:
    "The form asks for the received dates together and asks for the applicant type with the organization. The XML order doesn't change.",
};

const organizationRequired: Pinned = {
  plan: "yes",
  source: "no",
  category: "upstream",
  reason:
    "The XSD requires this field inside Organization, but lets the applicant leave out Organization entirely. DAT 07a-1 to 07d require the organization, so the form requires this field too.",
};

const nonemptyExplanation: Pinned = {
  plan: 1,
  source: 0,
  category: "intentional",
  reason:
    "The XSD accepts an empty string. When the DAT asks for an explanation, the form requires at least one character, because an empty explanation doesn't explain anything.",
};

const yesNoType: Pinned = {
  plan: null,
  source: "YesNoDataType",
  category: "intentional",
  reason:
    'The form stores a true or false answer, and the XML mapping writes it as the XSD\'s "Y: Yes" or "N: No".',
};

const yesNoEnum: Pinned = {
  ...yesNoType,
  source: ["Y: Yes", "N: No"],
};

const certification: Pinned = {
  ...yesNoType,
  reason:
    'DAT 18 requires checking "I Agree", so the form only accepts true, and the XML mapping writes it as "Y: Yes".',
};

const nonemptyIdentifier: Pinned = {
  plan: 1,
  source: 0,
  category: "intentional",
  reason:
    "The form reuses the question bank's identifier, which rejects an empty string. An applicant leaves the optional field blank instead, which leaves the element out of the XML.",
};

const congressionalDistrict = (
  source: number | null,
  plan: number | string,
): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason:
    "globLib:CongressionalDistrictDataType allows 1 to 6 characters with no pattern. The shared question requires the DAT's format: two state characters, a hyphen and three district characters (CA-005, 00-000).",
});

/** `differingRules` entries for an amount the XSD bounds as a number and the form as a string. */
const budgetBounds = (paths: string[]): Record<string, Pinned> =>
  Object.fromEntries(
    paths.flatMap((path) => [
      [`${path}/minimum`, { ...BUDGET_AMOUNT, plan: null, source: 0 }],
      [
        `${path}/maximum`,
        { ...BUDGET_AMOUNT, plan: null, source: 999999999999.99 },
      ],
    ]),
  );

const CONGRESSIONAL_DISTRICT_PATTERN = "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$";

const AMOUNT_PATTERN = "^\\d{1,12}([.]\\d{2})?$";

/** XSD entries for an amount the form stores as a string. */
const budgetAmountXsd = (path: string): Record<string, Pinned> => ({
  [`${path}/maxLength`]: { ...BUDGET_AMOUNT, plan: 15, source: null },
  [`${path}/pattern`]: { ...BUDGET_AMOUNT, plan: AMOUNT_PATTERN, source: null },
  ...budgetBounds([path]),
});

export const DIFF: FormDiff = {
  slug: "sf424-mandatory-form",
  xml: "xml-mapping",
  wording: {
    labels: {
      category: "intentional",
      reason:
        "The form's labels leave out the paper's item numbers and name the role or context, and shared questions use the question bank's labels.",
    },
    help: {
      category: "intentional",
      reason:
        "Shared questions use the question bank's help. The form's own help keeps the DAT's rules, worded for a web form, without paper item numbers or date format instructions.",
    },
  },
  dat: {
    absentFromPlan: {
      "01a-2": radioChoice,
      "01a-3": radioChoice,
      "01a-4": radioChoice,
      "01a-5": radioChoice,
      "01b-2": radioChoice,
      "01b-3": radioChoice,
      "01b-4": radioChoice,
      "01c-2": radioChoice,
      "01c-3": radioChoice,
      "01d-2": radioChoice,
      "01d-3": radioChoice,
      "01d-4": radioChoice,
      "01d-5": radioChoice,
      "16-2": radioChoice,
      "16-4": radioChoice,
      "16-5": radioChoice,
      "17-2": radioChoice,
      "17-3": radioChoice,
    },
    outOfOrder: {
      "05-1": groupedFields,
      "08a-1": groupedFields,
      "08a-2": groupedFields,
      "08b-3": groupedFields,
    },
    differingRules: {
      "02-1/required": postPopulation,
      "18-10/required": postPopulation,
      "18-11/required": postPopulation,
      "18-12/maxOccurs": {
        plan: 100,
        source: 1,
        category: "upstream",
        reason:
          "DAT 18-12 counts one attachment row, but its XSD type accepts up to 100 files. The form counts the files.",
      },
      "15a-1/maxLength": { ...BUDGET_AMOUNT, plan: 15, source: null },
      "15b-1/maxLength": { ...BUDGET_AMOUNT, plan: 15, source: null },
    },
    differingHelp: {
      "07d-9": {
        ...SHARED_HELP,
        plan: "Enter the zip / postal code. A US ZIP code needs all nine digits (ZIP+4), and is required.",
        source:
          "Enter the nine-digit Postal Code (e.g., ZIP code). This field is required if the country is the United States.",
      },
    },
  },
  xsd: {
    differingRules: {
      "TypeOfSubmissionOtherDescription/minLength": nonemptyExplanation,
      "FrequencyOtherDescription/minLength": nonemptyExplanation,
      "ConsolidatedRequest/enumType": yesNoType,
      "ConsolidatedRequestExplanation/minLength": nonemptyExplanation,
      "ReceivedDate/required": postPopulation,
      "ApplicantID/minLength": nonemptyIdentifier,
      "StateApplicationID/minLength": nonemptyIdentifier,
      "Organization/OrganizationName/required": organizationRequired,
      "Organization/EIN/required": organizationRequired,
      "Organization/SAMUEI/required": organizationRequired,
      "Organization/Address/Street1/required": organizationRequired,
      "Organization/Address/City/required": organizationRequired,
      "Organization/Address/Country/required": organizationRequired,
      "OtherTypeApplicant/minLength": nonemptyExplanation,
      "CongressionalDistrictApplicant/minLength": congressionalDistrict(1, 6),
      "CongressionalDistrictApplicant/pattern": congressionalDistrict(
        null,
        CONGRESSIONAL_DISTRICT_PATTERN,
      ),
      "CongressionalDistrictProject/minLength": congressionalDistrict(1, 6),
      "CongressionalDistrictProject/pattern": congressionalDistrict(
        null,
        CONGRESSIONAL_DISTRICT_PATTERN,
      ),
      ...budgetAmountXsd("EstimatedFundingFederal"),
      ...budgetAmountXsd("EstimatedFundingMatch"),
      "ContactEmail/minLength": EMAIL_MIN_LENGTH,
      "DelinquentOnFederalDebt/enumType": yesNoType,
      "DelinquentFederalDebtExplanation/minLength": nonemptyExplanation,
      "ApplicationCertification/enumType": certification,
      "AuthorizedRepresentativeEmail/minLength": EMAIL_MIN_LENGTH,
      "AuthorizedRepresentativeSignature/required": postPopulation,
      "AuthorizedRepresentativeSignatureDate/required": postPopulation,
    },
  },
  jsonSchemaVsXsd: {
    differingRules: {
      "application.consolidated_request.answer/enum": yesNoEnum,
      "application.date_received/required": postPopulation,
      "applicant.delinquent_federal_debt.answer/enum": yesNoEnum,
      ...emailMinLength([
        "contacts.point_of_contact.email",
        "contacts.authorized_representative.email",
      ]),
      ...budgetBounds([
        "budget.funding_sources.federal",
        "budget.funding_sources.match",
      ]),
      "certification.agree/enum": {
        ...certification,
        plan: ["true"],
        source: ["Y: Yes", "N: No"],
      },
      "certification.signature/required": postPopulation,
      "certification.date_signed/required": postPopulation,
    },
  },
};
