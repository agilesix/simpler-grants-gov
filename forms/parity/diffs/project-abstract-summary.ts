import type { FormDiff } from "../harness/model.ts";

export const DIFF: FormDiff = {
  slug: "project-abstract-summary",
  xml: "xml-mapping",
  dat: {
    differingHelp: {
      "01-0": {
        plan: "SGG fills this from the selected funding opportunity.",
        source:
          "Funding Opportunity Number for the particular program announcement. Pre-populated from the Application cover sheet. This field is required.",
        category: "intentional",
        reason:
          "Existing SGG fills this from application context. The help describes the source the applicant sees in SGG.",
      },
      "02-0": {
        plan: "SGG fills this when the competition or opportunity supplies an assistance listing.",
        source:
          "Assistance Listing Number assigned to the Program. Pre-populated from the Application cover sheet.",
        category: "intentional",
        reason:
          "Existing SGG fills this from application context. The help describes the source the applicant sees in SGG.",
      },
    },
  },
};
