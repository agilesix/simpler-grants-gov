import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import { EMAIL_MIN_LENGTH, MUST_AGREE, SHARED_HELP } from "./common.ts";

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

const CONGRESSIONAL_DISTRICT_PATTERN = "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$";

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
    absentFromPlan: {},
    outOfOrder: {
      "05-1": groupedFields,
      "08a-1": groupedFields,
      "08a-2": groupedFields,
      "08b-3": groupedFields,
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
