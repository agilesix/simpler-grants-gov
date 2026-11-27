import type { FormDiff, Pinned } from "../harness/model.ts";
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

/** DAT 01a-1 to 01d-1, which write item 1's letters as "1.a.". */
const itemOneNumber = (plan: string, source: string): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason:
    "The label writes the item number as 1a, as the rest of the SF-424 family does. The DAT writes it as 1.a.",
});

const AMOUNT =
  "The amount field shows the dollar sign, so the label leaves off ($).";

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
): Pinned => ({ ...DISTRICT_FORMAT, plan, source });

const CONGRESSIONAL_DISTRICT_PATTERN = "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$";

/** Item 1 has two "Other (specify)" fields, so each label names the answer it explains. */
const otherWithParent = (plan: string, source: string): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason:
    'Item 1 asks two "Other (specify)" questions, so the label names the answer it explains. Otherwise the error list and its links show two identical labels.',
});

export const DIFF: FormDiff = {
  slug: "sf424-mandatory-form",
  xml: "xml-mapping",
  wording: {
    labels: BANK_WORDING.labels,
    help: {
      category: "intentional",
      reason:
        "Shared questions use the question bank's help. The form's own help keeps the DAT's rules, worded for a web form, without paper item numbers or date format instructions.",
    },
  },
  dat: {
    differingLabels: {
      "01a-1": itemOneNumber(
        "1a. Type of Submission",
        "1.a. Type of Submission",
      ),
      "01a-6": otherWithParent(
        "Type of Submission - Other (specify)",
        "Other (specify)",
      ),
      "01b-1": itemOneNumber("1b. Frequency", "1.b. Frequency"),
      "01b-5": otherWithParent(
        "Frequency - Other (specify)",
        "Other (specify)",
      ),
      "01c-1": itemOneNumber(
        "1c. Consolidated Application/Plan/Funding Request?",
        "1.c. Consolidated Application/Plan/Funding Request?",
      ),
      "01d-1": itemOneNumber("1d. Version", "1.d.Version"),
      "02-1": numberInSection("Date Received", "2. Date Received"),
      "03-1": numberInSection(
        "Applicant Identifier",
        "3. Applicant Identifier",
      ),
      "05-1": numberInSection(
        "Date Received by State",
        "5. Date Received by State",
      ),
      "06-1": numberInSection(
        "State Application Identifier",
        "6. State Application Identifier",
      ),
      "07a-1": fullItemNumber("7a. Legal Name", "a. Legal Name"),
      "07b-1": fullItemNumber(
        "7b. Employer/Taxpayer Identification Number (EIN/TIN)",
        "b. Employer/Taxpayer Identification Number (EIN/TIN)",
      ),
      "07c-1": fullItemNumber("7c. UEI", "c. UEI"),
      "08b-3": fullItemNumber(
        "8b. Additional Description",
        "b. Additional Description",
      ),
      "09-1": numberInSection(
        "Name of Federal Agency",
        "9. Name of Federal Agency",
      ),
      "10-1": numberInSection(
        "Assistance Listing Number",
        "10. Assistance Listing Number",
      ),
      "11-1": numberInSection(
        "Descriptive Title of Applicant's Project",
        "11. Descriptive Title of Applicant's Project",
      ),
      "12-1": numberInSection(
        "Areas Affected by Funding",
        "12. Areas Affected by Funding",
      ),
      "13a-1": fullItemNumber("13a. Applicant", "a. Applicant"),
      "13b-1": fullItemNumber("13b. Program/Project", "b. Program/Project"),
      "14a-1": fullItemNumber("14a. Start Date", "a. Start Date"),
      "14b-1": fullItemNumber("14b. End Date", "b. End Date"),
      "15a-1": fullItemNumber("15a. Federal", "a. Federal ($)", AMOUNT),
      "15b-1": fullItemNumber("15b. Match", "b. Match ($)", AMOUNT),
      "16-1": numberInSection(
        "Is Submission Subject to Review by State Under Executive Order 12372 Process?",
        "16. IS SUBMISSION SUBJECT TO REVIEW BY STATE UNDER EXECUTIVE ORDER 12372 PROCESS?",
      ),
      "17-1": numberInSection(
        "Is the Applicant Delinquent on Any Federal Debt?",
        "17. Is The Applicant Delinquent On Any Federal Debt?",
      ),
      "18-02": agreeFootnote("I Agree", "* I Agree"),
      "18-12": {
        plan: "Supporting Documents",
        source:
          "Attach supporting documents as specified in agency instructions.",
        category: "intentional",
        reason:
          "The DAT uses the instruction to attach files as the label. The form labels the list Supporting Documents and shows the instruction as help.",
      },
    },
    differingRules: {
      "18-12/maxOccurs": {
        plan: 100,
        source: 1,
        category: "upstream",
        reason:
          "DAT 18-12 counts one attachment row, but its XSD type accepts up to 100 files. The form counts the files.",
      },
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
      "ConsolidatedRequestExplanation/minLength": nonemptyExplanation,
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
      "ContactEmail/minLength": EMAIL_MIN_LENGTH,
      "DelinquentFederalDebtExplanation/minLength": nonemptyExplanation,
      "ApplicationCertification/enumType": {
        ...MUST_AGREE,
        plan: null,
        source: "YesNoDataType",
      },
      "AuthorizedRepresentativeEmail/minLength": EMAIL_MIN_LENGTH,
    },
  },
};
