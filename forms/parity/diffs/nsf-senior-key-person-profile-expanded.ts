import type { FormDiff, Recorded } from "../harness/model.ts";
import { ADDRESS_HEADING, BANK_WORDING, PROFILE_GROUPS } from "./common.ts";

/** Key-person fields the DAT allows once, though the XSD allows 99 key persons. */
const ONCE: Recorded = {
  category: "upstream",
  reason:
    "The DAT gives this key-person field 1 occurrence. The XSD allows 99 key persons, as the DAT's other key-person fields do.",
};

/** NSF ID's length, which the XSD sets with a pattern. */
const NSF_ID_LENGTH: Recorded = {
  category: "upstream",
  reason:
    "The DAT gives NSF ID a maximum of 9 characters. The XSD sets its length with the pattern [0-9A-Z]{9} and states no maximum, and the plan follows the XSD.",
};

export const DIFF: FormDiff = {
  slug: "nsf-senior-key-person-profile-expanded",
  wording: BANK_WORDING,
  dat: {
    absentFromPlan: { "1-10": ADDRESS_HEADING, "2-10": ADDRESS_HEADING },
    outOfOrder: {
      "1-07": PROFILE_GROUPS,
      "1-21": PROFILE_GROUPS,
      "2-07": PROFILE_GROUPS,
      "2-21": PROFILE_GROUPS,
    },
    differingRules: {
      "1-23/maxLength": { plan: null, source: 9, ...NSF_ID_LENGTH },
      "2-23/maxLength": { plan: null, source: 9, ...NSF_ID_LENGTH },
      "2-23/maxOccurs": { plan: 99, source: 1, ...ONCE },
      "2-30/maxOccurs": { plan: 99, source: 1, ...ONCE },
      "2-30/required": {
        plan: "conditional",
        source: "yes",
        category: "upstream",
        reason:
          "The DAT marks Synergistic Activities required. The XSD requires it only for each key person entered, and key persons are optional.",
      },
    },
  },
};
