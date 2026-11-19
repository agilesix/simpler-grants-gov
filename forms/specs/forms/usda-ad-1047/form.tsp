import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";

import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "#questions/person/index.tsp";
import "#questions/submission/index.tsp";

import "./examples.tsp";

using SimplerForms;

namespace Forms.AD1047;

// The data only: how an applicant is shown it is `AD1047Layout`, in layout.tsp.
/** USDA AD-1047, Grants.gov version 1.0. */
@Meta.form(#{ id: "usda-ad-1047", formName: "USDA AD-1047" })
@GrantsGov.form(#{
  legacyFormId: 545,
  shortFormName: "AD_1047",
  formVersion: "1.0",
  agencyCode: "SGG",
  ombNumber: "0505-0027",
  expirationDate: "2025-09-30",
})
@example(Examples.form, #{ title: "A university's certification" })
model AD1047 {
  organizationName: Questions.Organizations.OrgName;

  // `globLib:ProjectNameDataType`. Only this form asks it as an award number or project name.
  /** Enter the PR/Award Number or Project Name. This field is required. */
  @UI.label("PR/Award Number or Project Name")
  @minLength(1)
  @maxLength(60)
  projectName: string;

  @UI.label("Name")
  authorizedRepresentative: Questions.People.PersonName;

  title: Questions.People.PersonTitle;

  @UI.label("Signature(s)")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  signature?: Questions.Submission.Signature;

  @UI.label("Date")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  dateSigned?: Questions.Submission.SubmittedDate;
}
