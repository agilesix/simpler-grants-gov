import type { FormDiff, Pinned } from "../harness/model.ts";
import {
  FORWARD_POPULATED,
  PAPER_COPY_HELP,
  POST_POPULATED,
  postPopulated,
} from "./attestation.ts";

const SF_424 = "Pre-populated from the SF 424.";

/** Help for an answer Grants.gov copies from the SF-424, pinned word for word. */
const forwardPopulated = (plan: string, source: string): Pinned => ({
  ...FORWARD_POPULATED,
  plan,
  source: `${SF_424} ${source}`,
});

export const DIFF: FormDiff = {
  slug: "grants-gov-lobbying-form",
  dat: {
    differingLabels: {
      "6-7": { ...POST_POPULATED, plan: "Signature", source: "* SIGNATURE" },
      "6-8": { ...POST_POPULATED, plan: "Date", source: "* DATE" },
    },
    differingRules: postPopulated(["6-7", "6-8"]),
    differingHelp: {
      "5-0": forwardPopulated(
        "Enter the legal name of the organization.",
        "This is the legal name of the organization that will undertake the assistance activity. This should normally be the name under which the organization has registered with the Business Partner Network.",
      ),
      "6-1": forwardPopulated(
        "Enter the prefix.",
        "This is the prefix (e.g., Mr., Mrs., Rev.) for the name of the Authorized Representative.",
      ),
      "6-2": forwardPopulated(
        "Enter the first name.",
        "This is the first (given) name of the Authorized Representative who is signing this form.",
      ),
      "6-3": forwardPopulated(
        "Enter the middle name.",
        "This is the middle name of the Authorized Representative.",
      ),
      "6-4": forwardPopulated(
        "Enter the last name.",
        "This is the last (family) name of the Authorized Representative signing this form.",
      ),
      "6-5": forwardPopulated(
        "Enter the suffix.",
        "This is the suffix (e.g., Jr, Sr, PhD) for the name of the Authorized Representative.",
      ),
      "6-6": forwardPopulated(
        "Enter the position title.",
        "This is the title of the Authorized Representative who is signing this form.",
      ),
      "6-7": {
        ...PAPER_COPY_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "It is the organization's responsibility to assure that only properly authorized individuals sign in this capacity and/or submit the application to Grants.gov. If this application is submitted through Grants.gov leave blank. If a hard copy is submitted, the AOR must sign this block.",
      },
      "6-8": {
        ...PAPER_COPY_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "If this application is submitted through Grants.gov, the system will generate this date. If submitting a hard copy, enter the date the AOR signed the application.",
      },
    },
  },
  xsd: {
    differingRules: postPopulated([
      "AuthorizedRepresentativeSignature",
      "SubmittedDate",
    ]),
  },
  jsonSchemaVsXsd: {
    differingRules: postPopulated([
      "authorized_representative_signature",
      "submitted_date",
    ]),
  },
};
