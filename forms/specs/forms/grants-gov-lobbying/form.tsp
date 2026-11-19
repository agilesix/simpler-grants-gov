import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";

import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "#questions/person/index.tsp";
import "#questions/submission/index.tsp";

import "./examples.tsp";

using SimplerForms;

namespace Forms.GrantsGovLobbying;

// The data only: how an applicant is shown it is `GrantsGovLobbyingLayout`, in layout.tsp.
// Property names match SGG's existing `gg_lobbying_form`.
/** Grants.gov Lobbying Form, Grants.gov version 1.1. */
@Meta.form(#{ id: "grants-gov-lobbying", formName: "Grants.gov Lobbying Form" })
@GrantsGov.form(#{
  legacyFormId: 255,
  shortFormName: "GG_LobbyingForm",
  formVersion: "1.1",
  agencyCode: "SGG",
  ombNumber: "4040-0013",
  expirationDate: "2028-06-30",
})
@example(Examples.form, #{ title: "A research institute's certification" })
model GrantsGovLobbying {
  @UI.label("Applicant's Organization")
  organizationName: Questions.Organizations.OrgName;

  @UI.label("Name")
  authorizedRepresentativeName: Questions.People.PersonName;

  authorizedRepresentativeTitle: Questions.People.PersonTitle;

  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  authorizedRepresentativeSignature?: Questions.Submission.Signature;

  @UI.label("Date")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  submittedDate?: Questions.Submission.SubmittedDate;
}
