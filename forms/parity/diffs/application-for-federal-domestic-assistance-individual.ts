import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import { BANK_WORDING, EMAIL_MIN_LENGTH, NINE_DIGIT_ZIP } from "./common.ts";

/** Draft answers do not require values the API supplies only at submission. */
const postPopulation: Pinned = {
  plan: "no",
  source: "yes",
  category: "intentional",
  reason:
    "This is optional during draft entry and populated by the existing API upon submission. The final XML still requires it; submission/output tests check that boundary.",
};

const radioChoice: Recorded = {
  category: "upstream",
  reason:
    "This DAT row is one option of U.S. Citizenship (5c-2), not another answer. The plan keeps one Boolean and maps it to the source Yes/No value.",
};

const prefixLength: Pinned = {
  plan: 10,
  source: null,
  category: "gap",
  reason:
    "The DAT states a ten-character limit and permits free text, but the comparator currently suppresses length limits on every Popup. The plan and shared name question preserve the DAT/XSD limit; this is a source-reader limitation, not a missing DAT requirement.",
};

const citizenshipLabels: Recorded = {
  category: "upstream",
  reason:
    "The DAT requires country and residency date whenever citizenship is No, while its labels refer to foreign nationals and separately to permanent residents. The candidate follows the explicit business rules, keeps the source distinction visible and does not invent a third status. This source inconsistency remains for review.",
};

export const DIFF: FormDiff = {
  slug: "application-for-federal-domestic-assistance-individual",
  xml: "xml-mapping",
  wording: BANK_WORDING,
  dat: {
    outOfOrder: {
      "3-1": {
        category: "intentional",
        reason:
          "Date Received belongs to the application, so it follows the complete Opportunity Information section on screen. The XML-shaped mapping preserves the official XML sequence.",
      },
    },
    absentFromPlan: { "5c-3": radioChoice, "5c-4": radioChoice },
    differingRules: {
      "3-1/required": postPopulation,
      "7-4/required": postPopulation,
      "7-5/required": postPopulation,
      "5a-02/maxLength": prefixLength,
      "5a-06/maxLength": prefixLength,
    },
    differingHelp: {
      "5b-9": {
        ...NINE_DIGIT_ZIP,
        plan: "Enter the zip / postal code. This field is required if the country is the United States.",
        source:
          "Enter the nine-digit Postal Code (e.g., ZIP code). This field is required if the country is the United States.",
      },
      "5c-7": {
        ...citizenshipLabels,
        plan: "Select the country. This field is required if the applicant is not a U.S. citizen.",
        source:
          "Select the Country from the provided list.  This field is required if the applicant is not a U.S. Citizen.",
      },
      "5c-8": {
        ...citizenshipLabels,
        plan: "Enter the start date of the most recent residency in the U.S. This field is required if the applicant is not a U.S. citizen.",
        source:
          "Enter the start date of the most recent residency in the U.S. Enter in the format MM/DD/YYYY.  This field is required if the applicant is not a U.S. Citizen.",
      },
    },
  },
  xsd: {
    differingRules: {
      "Date_Received/required": postPopulation,
      "AORSignature/required": postPopulation,
      "AORDate/required": postPopulation,
      "AuthorizedRepresentativeEmail/minLength": EMAIL_MIN_LENGTH,
    },
  },
  jsonSchemaVsXsd: {
    differingRules: {
      "date_received/required": postPopulation,
      "certification.signature/required": postPopulation,
      "certification.date_signed/required": postPopulation,
      "applicant.email/minLength": EMAIL_MIN_LENGTH,
      "applicant.citizenship.is_us_citizen/enum": {
        plan: null,
        source: ["Y: Yes", "N: No"],
        category: "intentional",
        reason:
          "The answer is Boolean; the existing boolean_to_yes_no transform writes the XSD's exact Yes/No codes. XML tests exercise both values.",
      },
      "certification.agree/enum": {
        plan: ["true"],
        source: ["Y: Yes", "N: No"],
        category: "intentional",
        reason:
          "The DAT requires checking I Agree, so false is not a valid certification. The existing transform writes the affirmative Yes code.",
      },
    },
  },
};
