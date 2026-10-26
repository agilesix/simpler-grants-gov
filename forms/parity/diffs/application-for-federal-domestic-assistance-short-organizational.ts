import type { FormDiff, Recorded } from "../harness/model.ts";
import { standardLabel, EMAIL_MIN_LENGTH } from "./common.ts";

const CONTACT_SKIP_GAP: Recorded = {
  category: "gap",
  reason:
    "The DAT says skip to item9,while existing SGG48d93f88 requires contact_person regardless of the checkbox. Candidate keeps that behavior and states it openly. This source interaction remains an unresolved policy gap,not an accepted waiver.",
};
const GROUPED_CHOICES: Recorded = {
  category: "intentional",
  reason:
    "Three source controls become one min1/max3 choice question with explicit indexed source_bindings. The first selection is required and the later two optional;the logical prompt covers the group.",
};
const DRAFT_OUTPUTS: Recorded = {
  category: "intentional",
  reason:
    "Source-required submission outputs are absent in an editable draft and are populated by existing pre/post-submission services. Candidate keeps the existing draft contract;original-XSD wire validity requires populated context and remains separately tested.",
};
const COUNTRY_REQUIRED: Recorded = {
  category: "intentional",
  reason:
    "The DAT required column is unconditional but its help limits State/ZIP to USA. Plan follows that explicit condition and current SGG behavior;the condition is not a waiver of a US address obligation.",
};
const WEB_POLICY_GAP: Recorded = {
  category: "gap",
  reason:
    "Existing SGG uses optional string length1..250;DAT maximum50 and XSD anyURI have different obligations. Candidate preserves the current API contract. A source/consumer policy decision and production URI behavior remain open.",
};
const CONTACT_REQUIRED: Recorded = {
  category: "upstream",
  reason:
    "DAT/current SGG48d93f88 requires this contact member while the original XSD permits omission. Preserve current API admission and retain the source discrepancy for review. No source-policy approval is inferred.",
};
/** Exact field pins. Known gaps remain review obligations,not source acceptance. */
export const DIFF: FormDiff = {
  slug: "application-for-federal-domestic-assistance-short-organizational",
  dat: {
    differingLabels: {
      "1": standardLabel(
        "* Name of Federal Agency",
        "* 1. NAME OF FEDERAL AGENCY",
      ),
      "2-1": standardLabel(
        "Assistance Listing Number",
        "2. ASSISTANCE LISTING NUMBER",
      ),
      "3-1": standardLabel("Date Received", "* 3. DATE RECEIVED"),
      "4-1": standardLabel(
        "* Funding Opportunity Number",
        "* 4. FUNDING OPPORTUNITY NUMBER",
      ),
      "4-2": standardLabel("* Funding Opportunity Title", "* TITLE"),
      "5a-1": standardLabel("* Legal Name", "* a. Legal Name"),
      "5b-6": standardLabel("State", "* State"),
      "5b-9": standardLabel("Zip / Postal Code", "* Zip/Postal Code"),
      "5c-2": standardLabel("Web Address", "http://"),
      "5d-1": standardLabel(
        "* Type of Applicant",
        "* d. Type of Applicant: Select Applicant Type Code(s)",
      ),
      "5d-4": standardLabel("Other Applicant Type", "* Other (specify)"),
      "5e-1": standardLabel(
        "* EIN/TIN",
        "* e. Employer/Taxpayer Identification Number (EIN/TIN)",
      ),
      "5f-1": standardLabel("* UEI", "* f. UEI"),
      "5g-1": standardLabel(
        "* Congressional District of Applicant",
        "* g. Congressional District of Applicant",
      ),
      "6a-1": standardLabel("* Project Title", "* a. Project Title"),
      "6b-1": standardLabel(
        "* Project Description",
        "* b. Project Description",
      ),
      "7-10": standardLabel("* Phone Number", "* Telephone Number"),
      "7-15": standardLabel("County/Parish", "County/ Parish"),
      "7-16": standardLabel("State", "* State"),
      "7-19": standardLabel("Zip / Postal Code", "* Zip/Postal Code"),
      "8-02": {
        ...CONTACT_SKIP_GAP,
        plan: "Same as Project Director",
        source: "Same as Project Director (skip to item 9)",
      },
      "8-11": standardLabel("* Phone Number", "* Telephone Number"),
      "8-16": standardLabel("County/Parish", "County/ Parish"),
      "8-17": standardLabel("State", "* State"),
      "8-20": standardLabel("Zip / Postal Code", "* Zip/Postal Code"),
      "9-02": standardLabel("* I Agree", "* * I AGREE"),
      "9-12": standardLabel("* Phone Number", "* Telephone Number"),
      "9-14": standardLabel(
        "Signature",
        "* Signature of Authorized Representative",
      ),
      "9-15": standardLabel("Date Signed", "* Date Signed"),
    },
    differingHelp: {
      "5d-1": {
        ...GROUPED_CHOICES,
        plan: "Select the applicant type code that best describes the applicant organization.",
        source:
          "Select the appropriate applicant type code. This field is required.",
      },
      "5d-2": {
        ...GROUPED_CHOICES,
        plan: "Select the applicant type code that best describes the applicant organization.",
        source: "Select the appropriate applicant type code.",
      },
      "5d-3": {
        ...GROUPED_CHOICES,
        plan: "Select the applicant type code that best describes the applicant organization.",
        source: "Select the appropriate applicant type code.",
      },
    },
    differingRules: {
      "3-1/required": { ...DRAFT_OUTPUTS, plan: "conditional", source: "yes" },
      "5b-6/required": {
        ...COUNTRY_REQUIRED,
        plan: "conditional",
        source: "yes",
      },
      "5b-9/required": {
        ...COUNTRY_REQUIRED,
        plan: "conditional",
        source: "yes",
      },
      "5c-2/maxLength": { ...WEB_POLICY_GAP, plan: 250, source: 50 },
      "7-16/required": {
        ...COUNTRY_REQUIRED,
        plan: "conditional",
        source: "yes",
      },
      "7-19/required": {
        ...COUNTRY_REQUIRED,
        plan: "conditional",
        source: "yes",
      },
      "8-17/required": {
        ...COUNTRY_REQUIRED,
        plan: "conditional",
        source: "yes",
      },
      "8-20/required": {
        ...COUNTRY_REQUIRED,
        plan: "conditional",
        source: "yes",
      },
      "9-14/required": { ...DRAFT_OUTPUTS, plan: "conditional", source: "yes" },
      "9-15/required": { ...DRAFT_OUTPUTS, plan: "conditional", source: "yes" },
    },
  },
  xsd: {
    differingRules: {
      "DateReceived/required": {
        ...DRAFT_OUTPUTS,
        plan: "conditional",
        source: "yes",
      },
      "ApplicantWebAddress/minLength": {
        ...WEB_POLICY_GAP,
        plan: 1,
        source: null,
      },
      "ApplicantWebAddress/maxLength": {
        ...WEB_POLICY_GAP,
        plan: 250,
        source: null,
      },
      "ProjectDirectorGroup/Title/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Email/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Email/minLength": EMAIL_MIN_LENGTH,
      "ProjectDirectorGroup/Phone/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Name/FirstName/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Name/LastName/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Title/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Email/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Email/minLength": EMAIL_MIN_LENGTH,
      "ContactPersonGroup/Phone/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/Street1/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/City/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/Country/required": {
        ...CONTACT_REQUIRED,
        plan: "yes",
        source: "no",
      },
      "AuthorizedRepresentativeEmail/minLength": EMAIL_MIN_LENGTH,
      "AuthorizedRepresentativeSignature/required": {
        ...DRAFT_OUTPUTS,
        plan: "conditional",
        source: "yes",
      },
      "AuthorizedRepresentativeDateSigned/required": {
        ...DRAFT_OUTPUTS,
        plan: "conditional",
        source: "yes",
      },
    },
  },
};
