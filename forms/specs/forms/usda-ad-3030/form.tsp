import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";

import "#forms/index.tsp";
import "#questions/person/title.tsp";
import "#questions/submission/index.tsp";
import "#questions/types/yes-no.tsp";

import "./examples.tsp";

using SimplerForms;

namespace Forms.AD3030;

// The data only: how an applicant is shown it is `AD3030Layout`, in layout.tsp.
/** USDA AD-3030, Grants.gov version 2.0. */
@Meta.form(#{ id: "usda-ad-3030", formName: "USDA AD-3030" })
@GrantsGov.form(#{
  legacyFormId: 582,
  shortFormName: "AD_3030_2_0",
  formVersion: "2.0",
  agencyCode: "SGG",
  ombNumber: "0505-0025",
  expirationDate: "2025-09-30",
})
@example(Examples.noToBoth, #{ title: "No to both questions" })
@example(Examples.yesToBoth, #{ title: "Yes to both questions" })
model AD3030 {
  /** Enter the Applicant's Name. This field is required. */
  @UI.label("1. Applicant's Name")
  @minLength(1)
  @maxLength(140)
  applicantName: string;

  /** Enter the Applicant's Address including Zip Code. This field is required. */
  @UI.label("2. Applicant's Address (Including Zip Code)")
  @UI.widget(Rendering.Widget.TextArea)
  @minLength(1)
  @maxLength(300)
  applicantAddress: string;

  // The DAT requires 4 digits; the XSD only requires 4 characters.
  /** Enter the last four digits of the Tax ID Number. This field is required. */
  @UI.label("3. Tax ID No. (Last 4 Digits)")
  @minLength(4)
  @maxLength(4)
  @pattern("^[0-9]{4}$")
  taxIdNumber: string;

  /** One selection is required. */
  @UI.label("4A. Has the Applicant been convicted of a felony criminal violation under any Federal law in the 24 months preceding the date of application?")
  applicantFelony: Questions.Types.YesNo;

  /** One selection is required. */
  @UI.label("4B. Does the Applicant have any unpaid Federal tax liability that has been assessed, for which all judicial and administrative remedies have been exhausted or have lapsed, and that is not being paid in a timely manner pursuant to an agreement with the authority responsible for collecting the tax liability?")
  unpaidFederalTax: Questions.Types.YesNo;

  @UI.label("5A. Applicant's Signature (By)")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  signature?: Questions.Submission.Signature;

  @UI.label("5B. Title/Relationship of the Individual if Signing in a Representative Capacity")
  title: Questions.People.PersonTitle;

  @UI.label("5C. Date Signed (MM-DD-YYYY)")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  dateSigned?: Questions.Submission.SubmittedDate;
}
