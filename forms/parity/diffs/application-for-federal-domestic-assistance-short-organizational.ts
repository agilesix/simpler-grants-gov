import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import {
  agreeFootnote,
  BANK_WORDING,
  conditionalStar,
  DISTRICT_FORMAT,
  fullItemNumber,
  MUST_AGREE,
  numberInSection,
} from "./common.ts";

const email = {
  category: "intentional",
  reason:
    "The email format already rejects empty values in the form schema. The XSD states a separate minimum length of one.",
} as const;
const zipState = {
  category: "upstream",
  reason:
    "The DAT marks the field required and its instructions limit that requirement to US addresses. The shared address makes it conditional.",
} as const;
const shortContact = {
  category: "intentional",
  reason:
    "The form requires the contact's details in item 8, as the existing SGG form does, even when Same as Project Director is checked. The XSD lets the applicant leave them out, and the DAT says to skip to item 9 when the director is the contact.",
} as const;
const shortRole = {
  category: "upstream",
  reason:
    "The DAT and maintained SGG require the project director’s title, phone and email. The shared XSD type permits omission.",
} as const;
const shortDateDat = {
  category: "upstream",
  reason:
    "DAT row 3-1 shows the received date as a label, not a field. The XSD requires the element, so the plan keeps the field, which Grants.gov completes on submission.",
} as const;
const url = {
  category: "intentional",
  reason:
    "The form keeps the existing SGG form's limit of 250 characters of text. The DAT allows 50 characters, and the XSD uses anyURI with no length limit.",
} as const;

const TYPE_LIST =
  'The form asks for up to three types in one list, so the label leaves off the DAT\'s "Select Applicant Type Code(s)" prompt.';
/** DAT 5d-2 and 5d-3, the second and third applicant types. */
const typeListLabel = (source: string): Pinned => ({
  plan: "5d. Type of Applicant",
  source,
  category: "intentional",
  reason:
    "The form asks for up to three types in one list, so each of the DAT's three type rows has the list's label, 5d. Type of Applicant.",
});

/** Item 8's checkbox, which the DAT uses to skip item 8. */
const sameAsDirector: Recorded = {
  category: "intentional",
  reason:
    "The form requires item 8, as the existing SGG form does, so it doesn't tell the applicant to skip to item 9. The help asks for the director's details again instead.",
};

export const DIFF: FormDiff = {
  slug: "application-for-federal-domestic-assistance-short-organizational",
  xml: "xml-mapping",
  wording: BANK_WORDING,
  dat: {
    absentFromSource: {
      "3-1": shortDateDat,
    },
    differingLabels: {
      "1": numberInSection(
        "Name of Federal Agency",
        "1. NAME OF FEDERAL AGENCY",
      ),
      "2-1": numberInSection(
        "Assistance Listing Number",
        "2. ASSISTANCE LISTING NUMBER",
      ),
      "4-1": numberInSection(
        "Funding Opportunity Number",
        "4. FUNDING OPPORTUNITY NUMBER",
      ),
      "4-2": {
        plan: "Funding Opportunity Title",
        source: "TITLE",
        category: "intentional",
        reason:
          "The label names the funding opportunity, so it makes sense on its own in the error list. The DAT prints only TITLE beside item 4's number.",
      },
      "5a-1": fullItemNumber("5a. Legal Name", "a. Legal Name"),
      "5c-2": {
        plan: "5c. Web Address",
        source: "http://",
        category: "intentional",
        reason:
          "The DAT's label is the http:// prefix printed in the box. The form labels the field with item 5c's name, Web Address.",
      },
      "5d-1": fullItemNumber(
        "5d. Type of Applicant",
        "d. Type of Applicant: Select Applicant Type Code(s)",
        TYPE_LIST,
      ),
      "5d-2": typeListLabel("Type of Applicant"),
      "5d-3": typeListLabel("Type of Applicant"),
      "5d-4": conditionalStar("Other (specify)"),
      "5e-1": fullItemNumber(
        "5e. Employer/Taxpayer Identification Number (EIN/TIN)",
        "e. Employer/Taxpayer Identification Number (EIN/TIN)",
      ),
      "5f-1": fullItemNumber("5f. UEI", "f. UEI"),
      "5g-1": fullItemNumber(
        "5g. Congressional District of Applicant",
        "g. Congressional District of Applicant",
      ),
      "6a-1": fullItemNumber("6a. Project Title", "a. Project Title"),
      "6b-1": fullItemNumber(
        "6b. Project Description",
        "b. Project Description",
      ),
      "8-02": {
        ...sameAsDirector,
        plan: "Same as Project Director",
        source: "Same as Project Director (skip to item 9)",
      },
      "9-02": agreeFootnote("I Agree", "* I AGREE"),
    },
    differingHelp: {
      "8-02": {
        ...sameAsDirector,
        plan: "If checked, enter the Project Director's details from item 7 again here.",
        source:
          "Check here if this person is also the project director and skip to item 9. If Primary Contact/Grants Administrator is same as Authorizing Official, please complete both 8 and 9.",
      },
    },
    differingRules: {
      "5b-6/required": { ...zipState, plan: "conditional", source: "yes" },
      "5b-9/required": { ...zipState, plan: "conditional", source: "yes" },
      "5c-2/maxLength": { ...url, plan: 250, source: 50 },
      "7-16/required": { ...zipState, plan: "conditional", source: "yes" },
      "7-19/required": { ...zipState, plan: "conditional", source: "yes" },
      "8-17/required": { ...zipState, plan: "conditional", source: "yes" },
      "8-20/required": { ...zipState, plan: "conditional", source: "yes" },
    },
  },
  xsd: {
    differingRules: {
      "ApplicantWebAddress/minLength": { ...url, plan: 1, source: null },
      "CongressionalDistrictApplicant/minLength": {
        ...DISTRICT_FORMAT,
        plan: 6,
        source: 1,
      },
      "CongressionalDistrictApplicant/pattern": {
        ...DISTRICT_FORMAT,
        plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
        source: null,
      },
      "ApplicantWebAddress/maxLength": { ...url, plan: 250, source: null },
      "ProjectDirectorGroup/Title/required": {
        ...shortRole,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Phone/required": {
        ...shortRole,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Email/required": {
        ...shortRole,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Email/minLength": {
        ...email,
        plan: null,
        source: 1,
      },
      "ContactPersonGroup/Name/FirstName/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Name/LastName/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Title/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/Street1/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/City/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/Country/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Phone/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Email/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Email/minLength": { ...email, plan: null, source: 1 },
      "ApplicationCertification/enumType": {
        ...MUST_AGREE,
        plan: null,
        source: "YesNoDataType",
      },
      "AuthorizedRepresentativeEmail/minLength": {
        ...email,
        plan: null,
        source: 1,
      },
    },
  },
};
