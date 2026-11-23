import type { FormDiff, Recorded } from "../harness/model.ts";
import { FORWARD_POPULATED, postPopulated } from "./attestation.ts";
import { SHARED_HELP } from "./common.ts";

/** A DAT label in parentheses, as the paper form prints it under a blank. */
const PARENTHESES: Recorded = {
  category: "intentional",
  reason:
    "The paper form prints this label in parentheses under a blank line. The form uses the same words without the parentheses, since the label sits above the field.",
};

export const DIFF: FormDiff = {
  slug: "assurances-as-to-labor-standards",
  dat: {
    differingLabels: {
      "01-1": {
        ...PARENTHESES,
        plan: "* Institution Name",
        source: "(Institution name)",
      },
      "03-0": {
        ...PARENTHESES,
        plan: "Signature of Institutional Grants Administrator or AOR",
        source: "(Signature of Institutional Grants Administrator or AOR)",
      },
      "03-1": { ...PARENTHESES, plan: "Date", source: "(Date)" },
    },
    differingRules: postPopulated(["03-0", "03-1"]),
    differingHelp: {
      "01-1": {
        ...FORWARD_POPULATED,
        plan: "Enter the legal name of the organization.",
        source: "This is the Applicant Information Legal Name from the SF-424.",
      },
      "03-0": {
        ...SHARED_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source: "Completed on submission to Grants.gov.",
      },
      "03-1": {
        ...SHARED_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source: "Completed on submission to Grants.gov.",
      },
    },
  },
  xsd: {
    differingRules: postPopulated(["RepresentativeName", "SubmittedDate"]),
  },
  jsonSchemaVsXsd: {
    differingRules: postPopulated(["signature", "submitted_date"]),
  },
};
