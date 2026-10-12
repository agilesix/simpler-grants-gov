import type { FormDiff } from "../harness/model.ts";
import { ADDRESS_HEADING, BANK_WORDING } from "./common.ts";

export const DIFF: FormDiff = {
  slug: "research-and-related-senior-key-person-profile-expanded",
  wording: BANK_WORDING,
  dat: {
    absentFromPlan: { "1-10": ADDRESS_HEADING, "2-10": ADDRESS_HEADING },
  },
  xsd: {
    differingRules: {
      "PDPI/Profile/BioSketchsAttached/BioSketchAttached/required": {
        plan: "yes",
        source: "no",
        category: "upstream",
        reason:
          "The DAT requires the PD/PI's biographical sketch (1-26); the XSD makes every sketch optional. The form follows the DAT.",
      },
    },
  },
};
