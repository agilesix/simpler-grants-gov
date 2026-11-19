import type { FormDiff, Pinned } from "../harness/model.ts";
import { FORWARD_POPULATED, postPopulated } from "./attestation.ts";
import { SHARED_HELP, unstarredRequired } from "./common.ts";

const COVER_SHEET = "Pre-populated from the Application cover sheet.";
const REQUIRED = " This field is required.";

/** Help for an answer Grants.gov copies from the SF-424, pinned word for word. */
const forwardPopulated = (plan: string, required: boolean): Pinned => ({
  ...FORWARD_POPULATED,
  plan,
  source: required ? COVER_SHEET + REQUIRED : COVER_SHEET,
});

const submitted: Pinned = {
  ...SHARED_HELP,
  plan: "Completed by Grants.gov upon submission.",
  source: "Completed by Grants.gov upon submission." + REQUIRED,
};

export const DIFF: FormDiff = {
  slug: "usda-ad-1047",
  dat: {
    differingLabels: {
      "3-1": unstarredRequired("Organization Name", "ORGANIZATION NAME"),
      "3-2": unstarredRequired(
        "PR/Award Number or Project Name",
        "PR/AWARD NUMBER OR PROJECT NAME",
      ),
      "4-3": unstarredRequired("First Name", "First Name"),
      "4-5": unstarredRequired("Last Name", "Last Name"),
      "4-7": unstarredRequired("Title", "Title"),
    },
    differingRules: postPopulated(["5-1", "5-2"]),
    differingHelp: {
      "3-1": forwardPopulated(
        "Enter the legal name of the organization.",
        true,
      ),
      "4-2": forwardPopulated("Enter the prefix.", false),
      "4-3": forwardPopulated("Enter the first name.", true),
      "4-4": forwardPopulated("Enter the middle name.", false),
      "4-5": forwardPopulated("Enter the last name.", true),
      "4-6": forwardPopulated("Enter the suffix.", false),
      "4-7": forwardPopulated("Enter the position title.", true),
      "5-1": submitted,
      "5-2": submitted,
    },
  },
  xsd: {
    differingRules: postPopulated(["AORSignature", "DateSigned"]),
  },
  jsonSchemaVsXsd: {
    differingRules: postPopulated(["signature", "date_signed"]),
  },
};
