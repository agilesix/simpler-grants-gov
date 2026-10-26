import type { FormDiff, Pinned } from "../harness/model.ts";

/** Pin literal labels independently of the editable plan; later edits must be reviewed again. */
const contextualLabel = (id: string, plan: string, source = "$"): Pinned => ({
  category: "intentional",
  reason: `Explicit column or question context replaces the PDF-dependent DAT label; proposed plan presentation choice for review. DAT FID408 v2.0, field ${id}.`,
  plan,
  source,
});

/** Exactly the sixteen source rows and their three columns, not an all-labels waiver. */
const costLabels = Object.fromEntries(
  Array.from({ length: 16 }, (_, index) => {
    const row = String(index + 1).padStart(2, "0");
    return [
      [`${row}-a`, contextualLabel(`${row}-a`, "Total Cost")],
      [
        `${row}-b`,
        contextualLabel(`${row}-b`, "Costs Not Allowable for Participation"),
      ],
      [
        `${row}-c`,
        contextualLabel(`${row}-c`, "Total Allowable Costs (a - b)"),
      ],
    ];
  }).flat(),
);

/** Proposed presentation choices; no human acceptance or runtime evidence. */
export const DIFF: FormDiff = {
  slug: "budget-information-for-construction-programs-sf-424c",
  dat: {
    differingLabels: {
      ...costLabels,
      "17-2": contextualLabel(
        "17-2",
        "Federal Percentage Share",
        "Enter eligible costs from line 16c Multiply X",
      ),
      "17-4": contextualLabel("17-4", "Federal Share"),
    },
  },
};
