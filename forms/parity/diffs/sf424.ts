import type { FormDiff, Pinned } from "../harness/model.ts";
import {
  agreeFootnote,
  BANK_WORDING,
  conditionalStar,
  DISTRICT_FORMAT,
  fullItemNumber,
  numberInSection,
} from "./common.ts";

const total = {
  category: "intentional",
  reason:
    "SGG calculates the total from the six amounts before it validates, so the applicant never enters it. The form leaves it optional so a draft saves before the calculation runs.",
} as const;
const money = {
  category: "intentional",
  reason:
    "The shared budget questions store an amount as a string, as the API's budget forms do, so no amount is rounded. Their pattern admits only nonnegative amounts within the XSD's digits instead of stating a numeric range. The existing form also accepted a leading minus and up to 14 characters.",
} as const;
const TYPE_LIST =
  'The form asks for up to three types in one list, so the label leaves off the DAT\'s entry number and its "Select Applicant Type" prompt.';
/** DAT 09-1 and 09-2, the second and third applicant types. */
const typeListLabel = (source: string): Pinned => ({
  plan: "Type of Applicant",
  source,
  category: "intentional",
  reason: TYPE_LIST,
});
const attachments = {
  category: "upstream",
  reason:
    "The DAT allows one attachment container. The XSD allows up to 100 files in it, and the plan follows the XSD, as the maintained SGG form does.",
} as const;
const regularContact = {
  category: "upstream",
  reason:
    "The DAT and maintained SGG form require first and last name. The original XSD permits the whole contact name to be omitted.",
} as const;
const email = {
  category: "intentional",
  reason:
    "The email format already rejects empty values in the form schema. The XSD states a separate minimum length of one.",
} as const;
const bool = {
  category: "intentional",
  reason:
    "The form stores a Boolean. The authored XML transform writes the source Yes/No enumeration.",
} as const;
const agree = {
  category: "intentional",
  reason:
    "The shared certification must be checked to submit. The authored XML transform writes Y: Yes.",
} as const;

const AMOUNTS = [
  ["federal", "Federal", "18-a"],
  ["applicant", "Applicant", "18-b"],
  ["state", "State", "18-c"],
  ["local", "Local", "18-d"],
  ["other", "Other", "18-e"],
  ["program_income", "ProgramIncome", "18-f"],
] as const;
const AMOUNT_PATTERN = "^\\d{1,12}([.]\\d{2})?$";
const TOTAL_PATTERN = "^\\d{1,13}([.]\\d{2})?$";
const AMOUNT_MAX = 999999999999.99;
const TOTAL_MAX = 9999999999999.99;

/** Each amount's rules against the XSD, keyed by element. */
const xsdAmounts = (): Record<string, Pinned> => {
  const rules = (
    element: string,
    length: number,
    pattern: string,
    max: number,
  ): [string, Pinned][] => [
    [`${element}/maxLength`, { ...money, plan: length, source: null }],
    [`${element}/pattern`, { ...money, plan: pattern, source: null }],
    [`${element}/minimum`, { ...money, plan: null, source: 0 }],
    [`${element}/maximum`, { ...money, plan: null, source: max }],
  ];
  return Object.fromEntries([
    ...AMOUNTS.flatMap(([, element]) =>
      rules(`${element}EstimatedFunding`, 15, AMOUNT_PATTERN, AMOUNT_MAX),
    ),
    ...rules("TotalEstimatedFunding", 16, TOTAL_PATTERN, TOTAL_MAX),
  ]);
};

export const DIFF: FormDiff = {
  slug: "sf424",
  xml: "xml-mapping",
  wording: BANK_WORDING,
  dat: {
    differingLabels: {
      "01-0": numberInSection("Type of Submission", "1. Type of Submission"),
      "02-0": numberInSection("Type of Application", "2. Type of Application"),
      "02-04": conditionalStar(
        "If Revision, select appropriate letter(s)",
        "If Revision, select appropriate letter(s)",
      ),
      "02-05": conditionalStar("Other (specify)", "Other (Specify)"),
      "03-0": numberInSection("Date Received", "3. Date Received"),
      "04-0": numberInSection(
        "Applicant Identifier",
        "4. Applicant Identifier",
      ),
      "06-1": numberInSection(
        "Date Received by State",
        "6. Date Received by State",
      ),
      "07-0": numberInSection(
        "State Application Identifier",
        "7. State Application Identifier",
      ),
      "08-a": fullItemNumber("8a. Legal Name", "a. Legal Name"),
      "08-b": fullItemNumber(
        "8b. Employer/Taxpayer Identification Number (EIN/TIN)",
        "b. Employer/Taxpayer Identification Number (EIN/TIN)",
      ),
      "08-c": fullItemNumber("8c. UEI", "c. UEI"),
      "08-d5": conditionalStar("State", "State"),
      "08-d8": conditionalStar("Zip / Postal Code", "Zip / Postal Code"),
      "09-0": numberInSection(
        "Type of Applicant",
        "9. Type of Applicant 1: Select Applicant Type",
        TYPE_LIST,
      ),
      "09-1": typeListLabel("Type of Applicant 2: Select Applicant Type"),
      "09-2": typeListLabel("Type of Applicant 3: Select Applicant Type"),
      "09-3": conditionalStar("Other (specify)", "Other (specify)"),
      "10-0": numberInSection(
        "Name of Federal Agency",
        "10. Name of Federal Agency",
      ),
      "11-0": numberInSection(
        "Assistance Listing Number",
        "11. Assistance Listing Number",
      ),
      "12-0": numberInSection(
        "Funding Opportunity Number",
        "12. Funding Opportunity Number",
      ),
      "13-0": numberInSection(
        "Competition Identification Number",
        "13. Competition Identification Number",
      ),
      "15-0": numberInSection(
        "Descriptive Title of Applicant's Project",
        "15. Descriptive Title of Applicant's Project",
      ),
      "16-a": fullItemNumber("16a. Applicant", "a. Applicant"),
      "16-b": fullItemNumber("16b. Program/Project", "b. Program/Project"),
      "17-a": fullItemNumber("17a. Start Date", "a. Start Date"),
      "17-b": fullItemNumber("17b. End Date", "b. End Date"),
      "18-a": fullItemNumber("18a. Federal", "a. Federal"),
      "18-b": fullItemNumber("18b. Applicant", "b. Applicant"),
      "18-c": fullItemNumber("18c. State", "c. State"),
      "18-d": fullItemNumber("18d. Local", "d. Local"),
      "18-e": fullItemNumber("18e. Other", "e. Other"),
      "18-f": fullItemNumber("18f. Program Income", "f. Program Income"),
      "18-g": fullItemNumber("18g. Total", "g. TOTAL"),
      "19-0": numberInSection(
        "Is Application Subject to Review By State Under Executive Order 12372 Process?",
        "19. Is Application Subject to Review By State Under Executive Order 12372 Process?",
      ),
      "20-0": numberInSection(
        "Is the Applicant Delinquent On Any Federal Debt?",
        '20. Is the Applicant Delinquent On Any Federal Debt? (If "Yes," provide explanation in attachment.)',
        "The form puts the DAT's \"(If Yes, provide explanation in attachment.)\" in the question's help.",
      ),
      "21-1": agreeFootnote("I Agree", "* I AGREE"),
    },
    differingRules: {
      "18-g/required": { ...total, plan: "no", source: "yes" },
      "15-1/maxOccurs": { ...attachments, plan: 100, source: 1 },
    },
  },
  xsd: {
    differingRules: {
      "StateApplicationID/minLength": {
        plan: 1,
        source: 0,
        category: "intentional",
        reason:
          "The form reuses the shared state application identifier question, which rejects an empty string. Leaving the optional field blank omits it, so no answer the XSD accepts is lost.",
      },
      "ContactPerson/FirstName/required": {
        ...regularContact,
        plan: "yes",
        source: "no",
      },
      "ContactPerson/LastName/required": {
        ...regularContact,
        plan: "yes",
        source: "no",
      },
      "Email/minLength": { ...email, plan: null, source: 1 },
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
      "CongressionalDistrictProgramProject/minLength": {
        ...DISTRICT_FORMAT,
        plan: 6,
        source: 1,
      },
      "CongressionalDistrictProgramProject/pattern": {
        ...DISTRICT_FORMAT,
        plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
        source: null,
      },
      ...xsdAmounts(),
      "TotalEstimatedFunding/required": { ...total, plan: "no", source: "yes" },
      "DelinquentFederalDebt/enumType": {
        ...bool,
        plan: null,
        source: "YesNoDataType",
      },
      "CertificationAgree/enumType": {
        ...agree,
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
