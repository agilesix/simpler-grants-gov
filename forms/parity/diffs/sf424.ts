import type { FormDiff } from "../harness/model.ts";

/** Source-pinned differences for the plan proposal; no runtime acceptance is implied. */
export const DIFF: FormDiff = {
  slug: "sf424",
  dat: {
    differingLabels: {
      "02-04": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 02-04 prints an asterisk but Required? is No and its business rule is conditional. The plan states the condition rather than making the answer unconditionally required.",
        plan: "If Revision, select appropriate letter(s)",
        source: "* If Revision, select appropriate letter(s)",
      },
      "02-05": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 02-05 prints an asterisk but Required? is No and its business rule is conditional. The plan states the condition rather than making the answer unconditionally required.",
        plan: "Other (Specify)",
        source: "* Other (Specify)",
      },
      "08-d5": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 08-d5 prints an asterisk but Required? is No and its business rule is conditional. The plan states the condition rather than making the answer unconditionally required.",
        plan: "State",
        source: "* State",
      },
      "08-d8": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 08-d8 prints an asterisk but Required? is No and its business rule is conditional. The plan states the condition rather than making the answer unconditionally required.",
        plan: "Zip / Postal Code",
        source: "* Zip / Postal Code",
      },
      "09-0": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 09-0 is one numbered source slot in the proposed one-to-three applicant-type list, matching current SGG applicant_type_code. One grouped label replaces three repeated prompts; finite bindings retain all positions and first-only requiredness. Human review of wording remains pending.",
        plan: "* Applicant types",
        source: "* 9. Type of Applicant 1: Select Applicant Type",
      },
      "09-1": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 09-1 is one numbered source slot in the proposed one-to-three applicant-type list, matching current SGG applicant_type_code. One grouped label replaces three repeated prompts; finite bindings retain all positions and first-only requiredness. Human review of wording remains pending.",
        plan: "Applicant types",
        source: "Type of Applicant 2: Select Applicant Type",
      },
      "09-2": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 09-2 is one numbered source slot in the proposed one-to-three applicant-type list, matching current SGG applicant_type_code. One grouped label replaces three repeated prompts; finite bindings retain all positions and first-only requiredness. Human review of wording remains pending.",
        plan: "Applicant types",
        source: "Type of Applicant 3: Select Applicant Type",
      },
      "09-3": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 09-3 prints an asterisk but Required? is No and its business rule is conditional. The plan states the condition rather than making the answer unconditionally required.",
        plan: "Other (specify)",
        source: "* Other (specify)",
      },
      "14-1": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 14-1 has an empty Field Label. The proposed label names its source-defined answer using its Field ID/help and existing SGG purpose; no new answer or source condition is introduced.",
        plan: "Areas Affected",
        source: null,
      },
      "15-1": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 15-1 has an empty Field Label. The proposed label names its source-defined answer using its Field ID/help and existing SGG purpose; no new answer or source condition is introduced.",
        plan: "Additional Project Title",
        source: null,
      },
      "16-c": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 16-c has an empty Field Label. The proposed label names its source-defined answer using its Field ID/help and existing SGG purpose; no new answer or source condition is introduced.",
        plan: "Additional Congressional Districts",
        source: null,
      },
      "19-a1": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 19-a1 has an empty Field Label. The proposed label names its source-defined answer using its Field ID/help and existing SGG purpose; no new answer or source condition is introduced.",
        plan: "State Review Date",
        source: null,
      },
    },
    differingHelp: {
      "09-0": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 09-0 is one of three numbered applicant-type slots. Proposed grouped help preserves one-to-three selections, distinct codes and the conditional Other explanation from business rules09-0 through09-3; existing SGG already uses one array. Wording is proposed, not human accepted.",
        plan: "Select one to three different applicant types. A first selection is required. If any selection is X: Other (specify), explain the applicant type below.",
        source:
          "Select the appropriate applicant type. A selection is required.",
      },
      "09-1": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 09-1 is one of three numbered applicant-type slots. Proposed grouped help preserves one-to-three selections, distinct codes and the conditional Other explanation from business rules09-0 through09-3; existing SGG already uses one array. Wording is proposed, not human accepted.",
        plan: "Select one to three different applicant types. A first selection is required. If any selection is X: Other (specify), explain the applicant type below.",
        source: "Select the appropriate applicant type.",
      },
      "09-2": {
        category: "intentional",
        reason:
          "DAT FID713 v4.0 09-2 is one of three numbered applicant-type slots. Proposed grouped help preserves one-to-three selections, distinct codes and the conditional Other explanation from business rules09-0 through09-3; existing SGG already uses one array. Wording is proposed, not human accepted.",
        plan: "Select one to three different applicant types. A first selection is required. If any selection is X: Other (specify), explain the applicant type below.",
        source: "Select the appropriate applicant type.",
      },
    },
    differingRules: {
      "15-1/maxOccurs": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 15-1 describes one attachment control (Maximum Occurrences1), whose help says file(s). XSD AdditionalProjectTitle/AttachedFile permits100 documents and current SGG maxItems is100. The proposed plan preserves the document cardinality, separately from the number of source chooser controls.",
        plan: 100,
        source: 1,
      },
    },
  },
  xsd: {
    differingRules: {
      "ContactPerson/FirstName/required": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 08-f02/08-f04 and existing SGG SF424_v4_0 require contact first and last name. XSD ContactPerson is optional, making its descendants optional from the root. The plan proposes preserving DAT/current-SGG behavior; human source-policy review remains pending.",
        plan: "yes",
        source: "no",
      },
      "ContactPerson/LastName/required": {
        category: "upstream",
        reason:
          "DAT FID713 v4.0 08-f02/08-f04 and existing SGG SF424_v4_0 require contact first and last name. XSD ContactPerson is optional, making its descendants optional from the root. The plan proposes preserving DAT/current-SGG behavior; human source-policy review remains pending.",
        plan: "yes",
        source: "no",
      },
    },
  },
};
