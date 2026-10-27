import type { FormDiff, Recorded } from "../harness/model.ts";
import { standardLabel, EMAIL_MIN_LENGTH, SHARED_HELP } from "./common.ts";

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
const ZIP_POLICY_GAP: Recorded = {
  category: "gap",
  reason:
    "The DAT specifies nine-digit US ZIP guidance;existing SGG/general bank bounds permit shorter values. Candidate preserves current API admission. The source/consumer policy is unresolved;do not treat this comparison as source acceptance.",
};

const BOOLEAN_TRANSPORT: Recorded = {
  category: "intentional",
  reason:
    "Current SGG stores this answer as boolean. The existing XML boolean_to_yes_no transform supplies the source coded Y/N string. This difference records transport representation;no candidate XML mapping or submission is introduced.",
};

const CONTACT_ORDER: Recorded = {
  category: "intentional",
  reason:
    "The shared contact body groups name,title,address,phone,fax,email consistently. Answer paths and independent role ownership are unchanged;the source coordinates preserve original order for review.",
};

const CONTEXT_OWNERSHIP: Recorded = {
  category: "intentional",
  reason:
    "Source-populated context is identified as read-only and synthetic in this preview. No authenticated pre/post-population service is added. The DAT source instruction remains in the plan;service ownership is an integration boundary.",
};

const CONTROL_INSTRUCTIONS: Recorded = {
  category: "intentional",
  reason:
    "The control states the same entry task using the actual widget and one grouped selection. Native date entry follows browser formatting rather than a textual MM/DD/YYYY mask;JSON remains ISO date. Exact source instructions are retained in the plan.",
};

const CONTACT_SKIP_GAP_16: Recorded = {
  category: "gap",
  reason:
    "Source says skip contact when this person is director;current SGG always requires both roles. Candidate describes actual entry behavior and preserves independent answers. Copy/omit policy remains open.",
};

const CERTIFICATION_COPY: Recorded = {
  category: "intentional",
  reason:
    "The exact two-paragraph certification and assurances note appear at the section above this checkbox. The short control hint avoids duplicating legal prose. False is still admitted by the existing draft schema;submission acceptance remains untested.",
};

const EXISTING_ENUM_TRANSFORM: Recorded = {
  category: "intentional",
  reason:
    "Existing SGG uses lower-case state in the H API label. Its existing applicant_type_code_mapping normalizes that exact value to the XSD Public/State label. Preserve existing wire path and mapping;all24 labels are probed separately.",
};

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
  uiSchema: {
    outOfOrder: {
      "project_director.email": { ...CONTACT_ORDER },
      "project_director.phone_number": { ...CONTACT_ORDER },
      "project_director.fax": { ...CONTACT_ORDER },
      "contact_person.email": { ...CONTACT_ORDER },
      "contact_person.phone_number": { ...CONTACT_ORDER },
      "contact_person.fax": { ...CONTACT_ORDER },
    },
    differingLabels: {
      "applicant.street1": standardLabel("Street1", "Street 1"),
      "applicant.street2": standardLabel("Street2", "Street 2"),
      "project_director.address.street1": standardLabel("Street1", "Street 1"),
      "project_director.address.street2": standardLabel("Street2", "Street 2"),
      "contact_person.address.street1": standardLabel("Street1", "Street 1"),
      "contact_person.address.street2": standardLabel("Street2", "Street 2"),
    },
    differingHelp: {
      agency_name: {
        ...CONTEXT_OWNERSHIP,
        plan: "Pre-populated from the Application cover sheet.",
        source:
          "Name of the Federal agency. Supplied by the application/opportunity service; example context is illustrative.",
      },
      assistance_listing_number: {
        ...CONTEXT_OWNERSHIP,
        plan: "Pre-populated from the Application cover sheet.",
        source:
          "Assistance Listing number supplied by the application/opportunity service, when available.",
      },
      assistance_listing_program_title: {
        ...CONTEXT_OWNERSHIP,
        plan: "Pre-populated from the Application cover sheet.",
        source:
          "Assistance Listing program title supplied by the application/opportunity service, when available.",
      },
      date_received: {
        ...CONTEXT_OWNERSHIP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "Completed by Grants.gov upon submission. No authentic submission is performed in the preview.",
      },
      funding_opportunity_number: {
        ...CONTEXT_OWNERSHIP,
        plan: "Pre-populated from the Application cover sheet.",
        source:
          "Funding opportunity number supplied by the application/opportunity service.",
      },
      funding_opportunity_title: {
        ...CONTEXT_OWNERSHIP,
        plan: "Pre-populated from the Application cover sheet.",
        source:
          "Funding opportunity title supplied by the application/opportunity service.",
      },
      organization_name: {
        ...SHARED_HELP,
        plan: "Enter the legal name of applicant that will undertake the assistance activity. This field is required.",
        source: "Enter the legal name of the organization.",
      },
      "applicant.street1": {
        ...SHARED_HELP,
        plan: "Enter the first line of the Street Address. This field is required.",
        source: "Enter the first line of the street address.",
      },
      "applicant.city": {
        ...SHARED_HELP,
        plan: "Enter the City. This field is required.",
        source: "Enter the city.",
      },
      "applicant.county": {
        ...SHARED_HELP,
        plan: "Enter the County/ Parish.",
        source: "Enter the county or parish.",
      },
      "applicant.state": {
        ...SHARED_HELP,
        plan: "Select the state, US possession or military code from the provided list. This field is required if Country is the United States.",
        source:
          "Select the state. This field is required if the country is the United States.",
      },
      "applicant.country": {
        ...SHARED_HELP,
        plan: "Select the Country from the provided list. This field is required.",
        source: "Select the country.",
      },
      "applicant.zip_code": {
        ...ZIP_POLICY_GAP,
        plan: "Enter the nine-digit Postal Code (e.g., ZIP code). This field is required if the country is the United States.",
        source:
          "Enter the zip / postal code. This field is required if the country is the United States.",
      },
      "applicant_type_code[]": {
        ...CONTROL_INSTRUCTIONS,
        plan: "Select the applicant type code that best describes the applicant organization.",
        source:
          "Select at least one and up to three applicant types, following agency instructions.",
      },
      applicant_type_other_specify: {
        ...CONTROL_INSTRUCTIONS,
        plan: 'Enter the applicant type here if you selected "Other (specify)" in 5d.',
        source:
          "Enter the applicant type here if you selected Other (specify).",
      },
      sam_uei: {
        ...CONTEXT_OWNERSHIP,
        plan: "UEI of the applicant organization. This field is pre-populated from the Application cover sheet.",
        source:
          "UEI supplied by the application/organization service. No SAM lookup is performed here.",
      },
      project_start_date: {
        ...CONTROL_INSTRUCTIONS,
        plan: "Enter the start date for the proposed project. Enter in the format MM/DD/YYYY. This field is required.",
        source:
          "Enter the start date for the proposed project. This field is required.",
      },
      project_end_date: {
        ...CONTROL_INSTRUCTIONS,
        plan: "Enter the end date for the proposed project. Enter in the format MM/DD/YYYY. This field is required.",
        source:
          "Enter the end date for the proposed project. This field is required.",
      },
      "project_director.name.prefix": {
        ...SHARED_HELP,
        plan: "Select the Prefix from the provided list or enter a new Prefix not provided on the list.",
        source: "Enter the prefix.",
      },
      "project_director.name.first_name": {
        ...SHARED_HELP,
        plan: "Enter the First Name. This field is required.",
        source: "Enter the first name.",
      },
      "project_director.name.last_name": {
        ...SHARED_HELP,
        plan: "Enter the Last Name. This field is required.",
        source: "Enter the last name.",
      },
      "project_director.name.suffix": {
        ...SHARED_HELP,
        plan: "Select the Suffix from the provided list or enter a new Suffix not provided on the list.",
        source: "Enter the suffix.",
      },
      "project_director.title": {
        ...SHARED_HELP,
        plan: "Enter the position title. This field is required.",
        source: "Enter the position title.",
      },
      "project_director.email": {
        ...SHARED_HELP,
        plan: "Enter a valid Email Address. This field is required.",
        source: "Enter a valid email address.",
      },
      "project_director.phone_number": {
        ...SHARED_HELP,
        plan: "Enter the daytime Telephone Number. This field is required.",
        source: "Enter the daytime telephone number.",
      },
      "project_director.address.street1": {
        ...SHARED_HELP,
        plan: "Enter the first line of the Street Address. This field is required.",
        source: "Enter the first line of the street address.",
      },
      "project_director.address.city": {
        ...SHARED_HELP,
        plan: "Enter the City. This field is required.",
        source: "Enter the city.",
      },
      "project_director.address.county": {
        ...SHARED_HELP,
        plan: "Enter the County/Parish.",
        source: "Enter the county or parish.",
      },
      "project_director.address.state": {
        ...SHARED_HELP,
        plan: "Select the state, US possession or military code from the provided list. This field is required if Country is the United States.",
        source:
          "Select the state. This field is required if the country is the United States.",
      },
      "project_director.address.country": {
        ...SHARED_HELP,
        plan: "Select the Country from the provided list. This field is required.",
        source: "Select the country.",
      },
      "project_director.address.zip_code": {
        ...ZIP_POLICY_GAP,
        plan: "Enter the nine-digit Postal Code (e.g., ZIP code). This field is required if the country is the United States.",
        source:
          "Enter the zip / postal code. This field is required if the country is the United States.",
      },
      same_as_project_director: {
        ...CONTACT_SKIP_GAP_16,
        plan: "Check here if this person is also the project director and skip to item 9. If Primary Contact/Grants Administrator is same as Authorizing Official, please complete both 8 and 9.",
        source:
          "Check if this person is also the project director. Complete the Primary Contact section below; both contacts are required on this form.",
      },
      "contact_person.name.prefix": {
        ...SHARED_HELP,
        plan: "Select the Prefix from the provided list or enter a new Prefix not provided on the list.",
        source: "Enter the prefix.",
      },
      "contact_person.name.first_name": {
        ...SHARED_HELP,
        plan: "Enter the First Name. This field is required.",
        source: "Enter the first name.",
      },
      "contact_person.name.last_name": {
        ...SHARED_HELP,
        plan: "Enter the Last Name. This field is required.",
        source: "Enter the last name.",
      },
      "contact_person.name.suffix": {
        ...SHARED_HELP,
        plan: "Select the Suffix from the provided list or enter a new Suffix not provided on the list.",
        source: "Enter the suffix.",
      },
      "contact_person.title": {
        ...SHARED_HELP,
        plan: "Enter the position title. This field is required.",
        source: "Enter the position title.",
      },
      "contact_person.email": {
        ...SHARED_HELP,
        plan: "Enter a valid Email Address. This field is required.",
        source: "Enter a valid email address.",
      },
      "contact_person.phone_number": {
        ...SHARED_HELP,
        plan: "Enter the daytime Telephone Number. This field is required.",
        source: "Enter the daytime telephone number.",
      },
      "contact_person.address.street1": {
        ...SHARED_HELP,
        plan: "Enter the first line of the Street Address. This field is required.",
        source: "Enter the first line of the street address.",
      },
      "contact_person.address.city": {
        ...SHARED_HELP,
        plan: "Enter the City. This field is required.",
        source: "Enter the city.",
      },
      "contact_person.address.county": {
        ...SHARED_HELP,
        plan: "Enter the County/Parish.",
        source: "Enter the county or parish.",
      },
      "contact_person.address.state": {
        ...SHARED_HELP,
        plan: "Select the state, US possession or military code from the provided list. This field is required if Country is the United States.",
        source:
          "Select the state. This field is required if the country is the United States.",
      },
      "contact_person.address.country": {
        ...SHARED_HELP,
        plan: "Select the Country from the provided list. This field is required.",
        source: "Select the country.",
      },
      "contact_person.address.zip_code": {
        ...ZIP_POLICY_GAP,
        plan: "Enter the nine-digit Postal Code (e.g., ZIP code). This field is required if the country is the United States.",
        source:
          "Enter the zip / postal code. This field is required if the country is the United States.",
      },
      application_certification: {
        ...CERTIFICATION_COPY,
        plan: "Check to select. This field is required.",
        source: "Read the certifications above and check to select.",
      },
      "authorized_representative.prefix": {
        ...SHARED_HELP,
        plan: "Select the Prefix from the provided list or enter a new Prefix not provided on the list.",
        source: "Enter the prefix.",
      },
      "authorized_representative.first_name": {
        ...SHARED_HELP,
        plan: "Enter the First Name. This field is required.",
        source: "Enter the first name.",
      },
      "authorized_representative.last_name": {
        ...SHARED_HELP,
        plan: "Enter the Last Name. This field is required.",
        source: "Enter the last name.",
      },
      "authorized_representative.suffix": {
        ...SHARED_HELP,
        plan: "Select the Suffix from the provided list or enter a new Suffix not provided on the list.",
        source: "Enter the suffix.",
      },
      authorized_representative_title: {
        ...SHARED_HELP,
        plan: "Enter the position title. This field is required.",
        source: "Enter the position title.",
      },
      authorized_representative_email: {
        ...SHARED_HELP,
        plan: "Enter a valid Email Address. This field is required.",
        source: "Enter a valid email address.",
      },
      authorized_representative_phone_number: {
        ...SHARED_HELP,
        plan: "Enter the daytime Telephone Number. This field is required.",
        source: "Enter the daytime telephone number.",
      },
      aor_signature: {
        ...CONTEXT_OWNERSHIP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "Completed by Grants.gov upon submission. Example text is synthetic context, not an actual signature.",
      },
      authorized_representative_date_signed: {
        ...CONTEXT_OWNERSHIP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "Completed by Grants.gov upon submission. Example context does not establish a submitted application.",
      },
    },
  },
  jsonSchemaVsXsd: {
    differingRules: {
      "date_received/required": { ...DRAFT_OUTPUTS, plan: "no", source: "yes" },
      "applicant_type_code[]/enum": {
        ...EXISTING_ENUM_TRANSFORM,
        plan: [
          "A: State Government",
          "B: County Government",
          "C: City or Township Government",
          "D: Special District Government",
          "E: Regional Organization",
          "F: U.S. Territory or Possession",
          "G: Independent School District",
          "H: Public/state Controlled Institution of Higher Education",
          "I: Indian/Native American Tribal Government (Federally Recognized)",
          "J: Indian/Native American Tribal Government (Other than Federally Recognized)",
          "K: Indian/Native American Tribally Designated Organization",
          "L: Public/Indian Housing Authority",
          "M: Nonprofit with 501C3 IRS Status (Other than Institution of Higher Education)",
          "N: Nonprofit without 501C3 IRS Status (Other than Institution of Higher Education)",
          "O: Private Institution of Higher Education",
          "P: Individual",
          "Q: For-Profit Organization (Other than Small Business)",
          "R: Small Business",
          "S: Hispanic-serving Institution",
          "T: Historically Black Colleges and Universities (HBCUs)",
          "U: Tribally Controlled Colleges and Universities (TCCUs)",
          "V: Alaska Native and Native Hawaiian Serving Institutions",
          "W: Non-domestic (non-US) Entity",
          "X: Other (specify)",
        ],
        source: [
          "A: State Government",
          "B: County Government",
          "C: City or Township Government",
          "D: Special District Government",
          "E: Regional Organization",
          "F: U.S. Territory or Possession",
          "G: Independent School District",
          "H: Public/State Controlled Institution of Higher Education",
          "I: Indian/Native American Tribal Government (Federally Recognized)",
          "J: Indian/Native American Tribal Government (Other than Federally Recognized)",
          "K: Indian/Native American Tribally Designated Organization",
          "L: Public/Indian Housing Authority",
          "M: Nonprofit with 501C3 IRS Status (Other than Institution of Higher Education)",
          "N: Nonprofit without 501C3 IRS Status (Other than Institution of Higher Education)",
          "O: Private Institution of Higher Education",
          "P: Individual",
          "Q: For-Profit Organization (Other than Small Business)",
          "R: Small Business",
          "S: Hispanic-serving Institution",
          "T: Historically Black Colleges and Universities (HBCUs)",
          "U: Tribally Controlled Colleges and Universities (TCCUs)",
          "V: Alaska Native and Native Hawaiian Serving Institutions",
          "W: Non-domestic (non-US) Entity",
          "X: Other (specify)",
        ],
      },
      "project_director.email/minLength": EMAIL_MIN_LENGTH,
      "same_as_project_director/enum": {
        ...BOOLEAN_TRANSPORT,
        plan: null,
        source: ["Y: Yes", "N: No"],
      },
      "contact_person.email/minLength": EMAIL_MIN_LENGTH,
      "application_certification/enum": {
        ...BOOLEAN_TRANSPORT,
        plan: null,
        source: ["Y: Yes", "N: No"],
      },
      "authorized_representative_email/minLength": EMAIL_MIN_LENGTH,
      "aor_signature/required": { ...DRAFT_OUTPUTS, plan: "no", source: "yes" },
      "authorized_representative_date_signed/required": {
        ...DRAFT_OUTPUTS,
        plan: "no",
        source: "yes",
      },
    },
  },
};
