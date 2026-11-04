import type { FormDiff } from "../harness/model.ts";
import { DIFF as epaKeyContacts } from "./epa-key-contacts.ts";
import { DIFF as keyContacts } from "./key-contacts.ts";
import { DIFF as performanceSites } from "./project-performance-site-location-s.ts";
import { DIFF as nsfKeyPersonExpanded } from "./nsf-senior-key-person-profile-expanded.ts";
import { DIFF as rrKeyPersonExpanded } from "./research-and-related-senior-key-person-profile-expanded.ts";
import { DIFF as rrKeyPerson } from "./research-related-senior-key-person-profile.ts";

import { DIFF as sf424bRr } from "./assurances-for-non-construction-programs-sf-424b-r-r.ts";
import { DIFF as ad3030 } from "./usda-ad-3030.ts";

/** Every form the suite checks. A plan with a `spec_id` must be listed here. */
export const DIFFS: FormDiff[] = [
  keyContacts,
  epaKeyContacts,
  rrKeyPerson,
  rrKeyPersonExpanded,
  nsfKeyPersonExpanded,
  performanceSites,
  sf424bRr,
  ad3030,
];
