import type { FormDiff } from "../harness/model.ts";
import { DIFF as epaKeyContacts } from "./epa-key-contacts.ts";
import { DIFF as keyContacts } from "./key-contacts.ts";
import { DIFF as nsfKeyPersonExpanded } from "./nsf-senior-key-person-profile-expanded.ts";
import { DIFF as rrKeyPersonExpanded } from "./research-and-related-senior-key-person-profile-expanded.ts";
import { DIFF as rrKeyPerson } from "./research-related-senior-key-person-profile.ts";
import { DIFF as projectAbstractSummary } from "./project-abstract-summary.ts";
import { DIFF as phsAssignmentRequest } from "./phs-assignment-request-form.ts";
import { DIFF as budgetNarrativeAttachment } from "./budget-narrative-attachment-form.ts";
import { DIFF as projectNarrativeAttachment } from "./project-narrative-attachment-form.ts";

/** Every form the suite checks. A plan with a `spec_id` must be listed here. */
export const DIFFS: FormDiff[] = [
  keyContacts,
  epaKeyContacts,
  rrKeyPerson,
  rrKeyPersonExpanded,
  nsfKeyPersonExpanded,
  projectAbstractSummary,
  phsAssignmentRequest,
  budgetNarrativeAttachment,
  projectNarrativeAttachment,
];
