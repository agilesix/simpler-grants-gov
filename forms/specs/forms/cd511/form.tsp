import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";

import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "#questions/person/index.tsp";
import "#questions/submission/index.tsp";

import "./examples.tsp";

using SimplerForms;

namespace Forms.CD511;

// The data only: how an applicant is shown it is `CD511Layout`, in layout.tsp. Property
// names match SGG's existing `cd511`.
/** CD511 Form, Grants.gov version 1.1. */
@Meta.form(#{ id: "cd511", formName: "CD511 Form" })
@GrantsGov.form(#{
  legacyFormId: 276,
  shortFormName: "CD511",
  formVersion: "1.1",
  agencyCode: "SGG",
})
@example(Examples.awardNumber, #{ title: "An award number" })
@example(Examples.projectName, #{ title: "A project name" })
@Validation.atLeastOneOf(CD511.awardNumber, CD511.projectName)
model CD511 {
  /** Enter legal name of applicant, which will undertake the assistance activity. */
  @UI.label("Name of Applicant")
  applicantName: Questions.Organizations.OrgName;

  // `globLib:ProjectAwardNumberDataType`
  /** Enter the project award number. Required if Project Name is blank. */
  @UI.label("Award Number")
  @minLength(1)
  @maxLength(25)
  awardNumber?: string;

  /** Enter the name of the project. Required if Award Number is blank. */
  @UI.label("Project Name")
  @minLength(1)
  @maxLength(60)
  projectName?: string;

  @UI.label("Name")
  contactPerson: Questions.People.PersonName;

  contactPersonTitle: Questions.People.PersonTitle;

  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  signature?: Questions.Submission.Signature;

  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  submittedDate?: Questions.Submission.SubmittedDate;
}
