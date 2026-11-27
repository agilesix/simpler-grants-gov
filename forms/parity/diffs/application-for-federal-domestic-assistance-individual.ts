import type { FormDiff, Recorded } from "../harness/model.ts";
import {
  agreeFootnote,
  BANK_WORDING,
  DISTRICT_FORMAT,
  EMAIL_MIN_LENGTH,
  fullItemNumber,
  MUST_AGREE,
  numberInSection,
  SHARED_HELP,
} from "./common.ts";

const citizenshipHelp: Recorded = {
  category: "intentional",
  reason:
    "The form's help drops \"from the provided list\" and the date format, since the country dropdown and date picker show both. The DAT's business rules require this field when U.S. Citizenship is No.",
};

export const DIFF: FormDiff = {
  slug: "application-for-federal-domestic-assistance-individual",
  xml: "xml-mapping",
  wording: BANK_WORDING,
  dat: {
    differingLabels: {
      "1": numberInSection(
        "Name of Federal Agency",
        "1. NAME OF FEDERAL AGENCY",
      ),
      "2-1": numberInSection(
        "Assistance Listing Number",
        "2. ASSISTANCE LISTING NUMBER",
      ),
      "3-1": numberInSection("Date Received", "3. DATE RECEIVED"),
      "4-1": numberInSection(
        "Funding Opportunity Number",
        "4. FUNDING OPPORTUNITY NUMBER",
      ),
      "5d": fullItemNumber(
        "5d. Congressional District of Applicant",
        "d. Congressional District of Applicant",
      ),
      "6a": fullItemNumber("6a. Project Title", "a. Project Title"),
      "6b": fullItemNumber("6b. Project Description", "b. Project Description"),
      "7-2": agreeFootnote("I Agree", "* I AGREE"),
    },
    differingHelp: {
      "5c-2": {
        plan: "Select Yes or No.",
        source: null,
        category: "intentional",
        reason:
          "The DAT gives U.S. Citizenship no help of its own; its options carry it. The form uses the shared Yes/No question, whose help asks for Yes or No.",
      },
      "5b-9": {
        ...SHARED_HELP,
        plan: "Enter the zip / postal code. A US ZIP code needs all nine digits (ZIP+4), and is required.",
        source:
          "Enter the nine-digit Postal Code (e.g., ZIP code). This field is required if the country is the United States.",
      },
      "5c-7": {
        ...citizenshipHelp,
        plan: "Select the country. This field is required if the applicant is not a U.S. citizen.",
        source:
          "Select the Country from the provided list.  This field is required if the applicant is not a U.S. Citizen.",
      },
      "5c-8": {
        ...citizenshipHelp,
        plan: "Enter the start date of the most recent residency in the U.S. This field is required if the applicant is not a U.S. citizen.",
        source:
          "Enter the start date of the most recent residency in the U.S. Enter in the format MM/DD/YYYY.  This field is required if the applicant is not a U.S. Citizen.",
      },
    },
  },
  xsd: {
    differingRules: {
      "ApplicationCertification/enumType": {
        ...MUST_AGREE,
        plan: null,
        source: "YesNoDataType",
      },
      "AuthorizedRepresentativeEmail/minLength": EMAIL_MIN_LENGTH,
      "CongressionalDistrictApplicant/minLength": {
        plan: 6,
        source: 1,
        ...DISTRICT_FORMAT,
      },
      "CongressionalDistrictApplicant/pattern": {
        plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
        source: null,
        ...DISTRICT_FORMAT,
      },
    },
  },
};
