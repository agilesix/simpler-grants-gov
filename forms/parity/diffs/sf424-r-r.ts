import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import {
  BANK_WORDING,
  DISTRICT_FORMAT,
  EMAIL_MIN_LENGTH,
  fullItemNumber,
  MUST_AGREE,
  numberInSection,
} from "./common.ts";

const revisionRows = {
  category: "intentional",
  reason:
    "DAT 08-1-1 to 08-1-5 share the single RevisionCode XML element. The preview offers the nine legal codes in one dropdown while the checkbox design is reviewed.",
} as const;
const importedEin = {
  category: "upstream",
  reason:
    "The imported organization type has an optional EIN element. DAT 06-0 collects EIN/TIN once, at the required root EmployerID.",
} as const;
const byPath = <T extends Recorded>(paths: string[], reason: T) =>
  Object.fromEntries(paths.map((path) => [path, reason]));

const byRule = (paths: string[], rules: Record<string, Pinned>) =>
  Object.fromEntries(
    paths.flatMap((path) =>
      Object.entries(rules).map(([rule, values]) => [
        `${path}/${rule}`,
        values,
      ]),
    ),
  );

const ein = byPath(["ApplicantInfo/OrganizationInfo/EIN"], importedEin);
export const DIFF: FormDiff = {
  slug: "sf424-r-r",
  xml: "xml-mapping",
  wording: BANK_WORDING,
  dat: {
    differingLabels: {
      "01-0": numberInSection("Type of Submission", "1. TYPE OF SUBMISSION"),
      "02-0": numberInSection("Date Submitted", "2. DATE SUBMITTED"),
      "03-0": numberInSection(
        "Date Received by State",
        "3. DATE RECEIVED BY STATE",
      ),
      "04-0": fullItemNumber(
        "4a. Federal Identifier",
        "4. a. Federal Identifier",
      ),
      "04-1": fullItemNumber(
        "4b. Agency Routing Identifier",
        "b. Agency Routing Identifier",
      ),
      "04-2": fullItemNumber(
        "4c. Previous Grants.gov Tracking ID",
        "c. Previous Grants.gov Tracking ID",
      ),
      "06-0": numberInSection(
        "Employer Identification (EIN) or (TIN)",
        "6. EMPLOYER IDENTIFICATION (EIN) or (TIN)",
      ),
      "07-0": numberInSection("Type of Applicant", "7. TYPE OF APPLICANT"),
      "08-0": numberInSection("Type of Application", "8. TYPE OF APPLICATION"),
      "09-0": numberInSection(
        "Name of Federal Agency",
        "9. NAME OF FEDERAL AGENCY",
      ),
      "10-1": numberInSection(
        "Assistance Listing Number",
        "10. ASSISTANCE LISTING NUMBER",
      ),
      "11-0": numberInSection(
        "Descriptive Title of Applicant's Project",
        "11. DESCRIPTIVE TITLE OF APPLICANT'S PROJECT",
      ),
      "15-1": fullItemNumber(
        "15a. Total Federal Funds Requested",
        "a. Total Federal Funds Requested",
      ),
      "15-2": fullItemNumber(
        "15b. Total Non-Federal Funds",
        "b. Total Non-Federal Funds",
      ),
      "15-3": fullItemNumber(
        "15c. Total Federal & Non-Federal Funds",
        "c. Total Federal & Non-Federal Funds",
      ),
      "15-4": fullItemNumber(
        "15d. Estimated Program Income",
        "d. Estimated Program Income",
      ),
      "16-0": numberInSection(
        "Is Application Subject to Review by State Executive Order 12372 Process?",
        "16. IS APPLICATION SUBJECT TO REVIEW BY STATE EXECUTIVE ORDER 12372 PROCESS?",
      ),
      "18-0": numberInSection(
        "SF-LLL or Other Explanatory Documentation",
        "18. SFLLL (Disclosure of Lobbying Activities) or other Explanatory Documentation",
        "The header has the full title, so the field uses the short name.",
      ),
      "20-0": numberInSection("Pre-application", "20. Pre-application"),
      "21-0": numberInSection(
        "Cover Letter Attachment",
        "21. Cover Letter Attachment",
      ),
    },
    absentFromPlan: {
      ...byPath(
        ["08-1-1", "08-1-2", "08-1-3", "08-1-4", "08-1-5"],
        revisionRows,
      ),
    },
    absentFromSource: { "08-1-1 through 08-1-5": revisionRows },
  },
  xsd: {
    absentFromPlan: ein,
    differingRules: {
      "TrustAgree/enumType": {
        ...MUST_AGREE,
        plan: null,
        source: "YesNoDataType",
      },
      ...byRule(
        [
          "ApplicantInfo/ContactPersonInfo/Email",
          "PDPIContactInfo/Email",
          "AORInfo/Email",
        ],
        { minLength: EMAIL_MIN_LENGTH },
      ),
      ...byRule(["CongressionalDistrict/ApplicantCongressionalDistrict"], {
        minLength: { ...DISTRICT_FORMAT, plan: 6, source: 1 },
        pattern: {
          ...DISTRICT_FORMAT,
          plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
          source: null,
        },
      }),
    },
  },
};
