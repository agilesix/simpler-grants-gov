import "simpler-forms";
import "../index.tsp";
import "../../questions/research/index.tsp";
import "./profile.tsp";

using SimplerForms;

namespace Forms.RRKeyPerson;

// The data only: how an applicant is shown it is in layout.tsp.
/** Research & Related Senior/Key Person Profile, Grants.gov version 3.0. */
@Meta.submission(#{
  id: "rr-key-person",
  legacyFormId: 772,
  shortFormName: "RR_KeyPerson",
  formVersion: "3.0",
  agencyCode: "SGG",
  ombNumber: "4040-0001",
})
model RRKeyPerson {
  principalInvestigator: RRKeyPersonEntry;

  @maxItems(7)
  @UI.widget(Rendering.Widget.CollapsibleFieldList)
  seniorKeyPersons?: RRKeyPersonEntry[];

  additionalProfiles?: Questions.Research.AdditionalProfiles;
  additionalBiographicalSketches?: Questions.Research.AdditionalBiographicalSketches;
  additionalCurrentPendingSupport?: Questions.Research.AdditionalCurrentPendingSupport;
}
