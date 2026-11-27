import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import { EMAIL_MIN_LENGTH, MUST_AGREE } from "./common.ts";

const revisionRows = {
  category: "intentional",
  reason:
    "DAT 08-1-1 to 08-1-5 share the single RevisionCode XML element. The preview offers the nine legal codes in one dropdown while the checkbox design is reviewed.",
} as const;
const importedEin = {
  category: "upstream",
  reason:
    "OptionalOrganizationType has an optional EIN element. DAT 06-0 collects EIN/TIN once, at the root EmployerID.",
} as const;
const district = {
  category: "intentional",
  reason:
    "The form uses the shared congressional district question, which requires the DAT's format: two state characters, a hyphen and three characters (MA-007, MD-all, 00-000). globLib:CongressionalDistrictDataType allows 1 to 6 characters with no pattern.",
} as const;
const layout = {
  category: "intentional",
  reason:
    "The form groups related questions together. The XML follows the XSD's order.",
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
  slug: "sf-424-r-r-multi-project-cover",
  xml: "xml-mapping",
  wording: {
    labels: {
      category: "intentional",
      reason:
        "The plan matches the bank and form labels used in the preview. The DAT retains the numbered source labels.",
    },
    help: {
      category: "intentional",
      reason:
        "The plan uses shared bank help and concise form-specific instructions. The DAT comparison retains the original wording.",
    },
  },
  dat: {
    outOfOrder: byPath(
      [
        "05-1",
        "06-0",
        "08-0",
        "08-1-6",
        "08-2",
        "08-2-3",
        "18-0",
        "19-14",
        "19-15",
      ],
      layout,
    ),
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
      ...byRule(
        [
          "ApplicantInfo/ContactPersonInfo/Email",
          "PDPIContactInfo/Email",
          "AORInfo/Email",
        ],
        { minLength: EMAIL_MIN_LENGTH },
      ),
      "TrustAgree/enumType": {
        ...MUST_AGREE,
        plan: null,
        source: "YesNoDataType",
      },
      ...byRule(["CongressionalDistrict/ApplicantCongressionalDistrict"], {
        minLength: { ...district, plan: 6, source: 1 },
        pattern: {
          ...district,
          plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
          source: null,
        },
      }),
    },
  },
};
