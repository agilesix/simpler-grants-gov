import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";

import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "#questions/submission/index.tsp";

import "./examples.tsp";

using SimplerForms;

namespace Forms.LaborStandards;

// The data only: how an applicant is shown it is `LaborStandardsLayout`, in layout.tsp.
/** ASSURANCES AS TO LABOR STANDARDS, Grants.gov version 1.0. */
@Meta.form(#{
  id: "labor-standards",
  formName: "ASSURANCES AS TO LABOR STANDARDS",
})
@GrantsGov.form(#{
  legacyFormId: 700,
  shortFormName: "NEH_Labor_Standards",
  formVersion: "1.0",
  agencyCode: "SGG",
  ombNumber: "3136-0134",
  expirationDate: "2027-10-31",
})
@example(Examples.form, #{ title: "A university's assurances" })
model LaborStandards {
  @UI.label("Institution Name")
  institutionName: Questions.Organizations.OrgName;

  @UI.label("Signature of Institutional Grants Administrator or AOR")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  signature?: Questions.Submission.Signature;

  @UI.label("Date")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  submittedDate?: Questions.Submission.SubmittedDate;
}
