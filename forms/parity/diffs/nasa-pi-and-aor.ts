import type { FormDiff, Pinned } from "../harness/model.ts";
import { conditionalStar, PREPOPULATED_HELP, SHARED_HELP } from "./common.ts";

const PREPOPULATED = "Pre-populated from the SF 424 (R&R).";

/** The name fields of one person, numbered from `block`-1, pinned to the bank's help. */
const nameHelp = (block: string): Record<string, Pinned> =>
  Object.fromEntries(
    ["prefix", "first name", "middle name", "last name", "suffix"].map(
      (part, index) => [
        `${block}-${index + 1}`,
        {
          ...PREPOPULATED_HELP,
          plan: `Enter the ${part}.`,
          source: PREPOPULATED,
        },
      ],
    ),
  );

const USERNAME_MIN_LENGTH: Pinned = {
  plan: null,
  source: 0,
  category: "intentional",
  reason:
    "The XSD sets UserName's minLength to 0, which allows any string. The form states no minimum.",
};

export const DIFF: FormDiff = {
  slug: "nasa-pi-and-aor",
  dat: {
    absentFromPlan: {},
    differingLabels: {
      "3-7": conditionalStar("If yes, Select U.S. Government agency"),
    },
    differingHelp: {
      ...nameHelp("2"),
      ...nameHelp("3"),
      "2-6": {
        plan: "If registered with NSPIRES, enter your username.",
        source: "If registered with NSPIRES enter your username",
        category: "intentional",
        reason: "The form adds punctuation to the DAT's help.",
      },
      "3-6": {
        ...SHARED_HELP,
        plan: "Select Yes or No.",
        source: "A selection is required.",
      },
      "3-9": {
        ...SHARED_HELP,
        plan: "Select Yes or No.",
        source: "A selection is required.",
      },
    },
    differingRules: {},
  },
  xsd: {
    differingRules: {
      "AuthorizedRepresentativeName/UserName/minLength": USERNAME_MIN_LENGTH,
    },
  },
};
