import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import { standardLabel } from "./common.ts";

const CONDITIONAL_LABEL: Recorded = {
  category: "intentional",
  reason:
    "The DAT prints an asterisk on a conditionally required field. The plan records the condition separately instead of making the asterisk part of its label or the answer unconditionally required. The source obligation is retained, not waived.",
};
const conditionalLabels: Record<string, Pinned> = Object.fromEntries(
  [
    ["1-07", "State", "* State"],
    ["1-10", "Zip / Postal Code", "* ZIP / Postal Code"],
    [
      "1-11",
      "Project/Performance Site Congressional District",
      "* Project/ Performance Site Congressional District",
    ],
    ["2-04", "Street1", "* Street1"],
    ["2-06", "City", "* City"],
    ["2-08", "State", "* State"],
    ["2-09", "Country", "* Country"],
    ["2-10", "Zip / Postal Code", "* ZIP / Postal Code"],
    [
      "2-11",
      "Project/Performance Site Congressional District",
      "* Project/ Performance Site Congressional District",
    ],
  ].map(([id, plan, source]) => [id, { ...CONDITIONAL_LABEL, plan, source }]),
);

/** FID723 v4.0 requirements only. No source-policy approval is inferred. */
export const DIFF: FormDiff = {
  slug: "project-performance-site-location-s",
  dat: {
    differingLabels: {
      ...conditionalLabels,
      "1-06": standardLabel("County/Parish", "County"),
      "2-07": standardLabel("County/Parish", "County"),
    },
    differingRules: {
      "1-0/maxOccurs": {
        category: "upstream",
        plan: 1,
        source: null,
        reason:
          "The primary-site checkbox DAT row leaves occurrences blank. The XSD has one PrimarySite with at most one Individual answer. The plan records that single answer; it does not infer a numeric DAT limit from the blank cell.",
      },
      "2-03/maxOccurs": {
        category: "upstream",
        plan: 299,
        source: 1,
        reason:
          "DAT Other Site UEI alone says maximum 1 while the site heading, neighboring fields and XSD OtherSite allow 299 sites, each with its own UEI. The plan follows the XSD/repeated-site scope and retains this source conflict for review.",
      },
    },
  },
  xsd: {
    differingRules: Object.fromEntries(
      ["PrimarySite", "OtherSite"].map((site) => [
        `${site}/CongressionalDistrictProgramProject/pattern`,
        {
          category: "upstream",
          plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
          source: null,
          reason:
            "DAT 1-11/2-11 requires six characters with a hyphen third. The XSD restricts length but states no pattern. The plan preserves existing SGG at1858f9a6 character validation rather than broadening it; this stricter policy is proposed for review, not a runtime pass.",
        },
      ]),
    ),
  },
};
