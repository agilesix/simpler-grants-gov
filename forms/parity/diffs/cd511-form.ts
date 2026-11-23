import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import {
  PAPER_COPY_HELP,
  POST_POPULATED,
  postPopulated,
} from "./attestation.ts";
import { FREE_TEXT_HELP, SHARED_HELP } from "./common.ts";

/** Award Number and Project Name, one of which is required. */
const ONE_OF: Recorded = {
  category: "intentional",
  reason:
    "The DAT stars both fields, but marks each one not required, and its business rules require one of them. The plan treats each as conditional, so it doesn't star either one.",
};

const ONE_OF_HELP: Recorded = {
  category: "intentional",
  reason:
    "The help adds the DAT's business rule, as SGG's existing form does, since the form has no rule to show which of the two is required.",
};

/** The contact person's name, which the XSD makes optional. */
const CONTACT_NAME: Pinned = {
  plan: "yes",
  source: "no",
  category: "intentional",
  reason:
    "The XSD makes ContactName optional, but the DAT and SGG's existing form require the contact person's first and last name.",
};

export const DIFF: FormDiff = {
  slug: "cd511-form",
  dat: {
    differingLabels: {
      "02-02": { ...ONE_OF, plan: "Award Number", source: "* AWARD NUMBER" },
      "02-03": { ...ONE_OF, plan: "Project Name", source: "* PROJECT NAME" },
      "02-10": { ...POST_POPULATED, plan: "Signature", source: "* SIGNATURE" },
      "02-11": { ...POST_POPULATED, plan: "Submitted Date", source: "* DATE" },
    },
    differingRules: postPopulated(["02-10", "02-11"]),
    differingHelp: {
      "02-02": {
        ...ONE_OF_HELP,
        plan: "Enter the project award number. Required if Project Name is blank.",
        source: "Enter the project award number.",
      },
      "02-03": {
        ...ONE_OF_HELP,
        plan: "Enter the name of the project. Required if Award Number is blank.",
        source: "Enter the name of the project.",
      },
      "02-04": {
        ...FREE_TEXT_HELP,
        plan: "Enter the prefix.",
        source:
          "Select the Prefix from the provided list or enter a new Prefix not provided on the list.",
      },
      "02-05": {
        ...SHARED_HELP,
        plan: "Enter the first name.",
        source: "Enter the First Name. This field is required.",
      },
      "02-07": {
        ...SHARED_HELP,
        plan: "Enter the last name.",
        source: "Enter the Last Name. This field is required.",
      },
      "02-08": {
        ...FREE_TEXT_HELP,
        plan: "Enter the suffix.",
        source:
          "Select the Suffix from the provided list or enter a new Suffix not provided on the list.",
      },
      "02-09": {
        ...SHARED_HELP,
        plan: "Enter the position title.",
        source: "Enter in the Position Title.",
      },
      "02-10": {
        ...PAPER_COPY_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "It is the organization's responsibility to assure that only properly authorized individuals sign in this capacity and/or submit the application to Grants.gov. If this application is submitted through Grants.gov leave blank. If a hard copy is submitted, the AOR must sign this block.",
      },
      "02-11": {
        ...PAPER_COPY_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "If this application is submitted through Grants.gov, the system will generate this date. If submitting a hard copy, enter the date the AOR signed the application.",
      },
    },
  },
  xsd: {
    differingRules: {
      ...postPopulated(["Signature", "SubmittedDate"]),
      "ProjectName/minLength": {
        plan: 1,
        source: 0,
        category: "intentional",
        reason:
          "The XSD allows an empty ProjectName. The form requires at least one character when one is given, as SGG's existing form does, so an empty answer can't stand in for the project.",
      },
      "ContactName/FirstName/required": CONTACT_NAME,
      "ContactName/LastName/required": CONTACT_NAME,
    },
  },
  jsonSchemaVsXsd: {
    differingRules: postPopulated(["signature", "submitted_date"]),
  },
};
