import "./examples.tsp";
import "form-library-xml";
import "simpler-forms";
import "#forms/index.tsp";
import "#questions/certification/index.tsp";
import "#questions/person/title.tsp";
import "#questions/types/yes-no.tsp";
using SimplerForms;
namespace Forms.USDAAD3030;

// Only source choice vocabulary is shared; the two applicant answers remain distinct.
alias YesNo = Questions.Types.YesNo;

@Meta.form(#{ id: "usda-ad-3030", formName: "USDA AD-3030" })
@GrantsGov.form(#{
  legacyFormId: 582,
  shortFormName: "AD_3030",
  formVersion: "2.0",
  agencyCode: "SGG",
  ombNumber: "0505-0025",
  expirationDate: "2025-09-30",
})
@example(
  Examples.sample1,
  #{
    title: "Completed context example",
    description: "Synthetic applicant and signing-context values for review; not a signed or submitted application.",
  }
)
@example(
  Examples.sample2,
  #{
    title: "Alternative source answers",
    description: "Exercises both Yes answers without making an eligibility determination.",
  }
)
model Representations {
  @UI.label("Applicant")
  applicant: Applicant;

  @UI.label("Certification")
  certification: Certification;
}

/** The corporate applicant and its two distinct representations. */
model Applicant {
  @UI.label("1. APPLICANT'S NAME")
  @doc("Enter the Applicant's Name. This field is required.")
  @UI.widget(Rendering.Widget.Text)
  @minLength(1)
  @maxLength(140)
  name: string;

  @UI.label("2. APPLICANT'S ADDRESS (Including Zip Code)")
  @doc("Enter the Applicant's Address including Zip Code. This field is required.")
  @UI.widget(Rendering.Widget.TextArea)
  @minLength(1)
  @maxLength(300)
  address: string;

  @UI.label("3. TAX ID NO. (Last 4 digits)")
  @doc("Enter the last four digits of the Tax ID Number. This field is required.")
  @UI.widget(Rendering.Widget.Text)
  @minLength(4)
  @maxLength(4)
  @pattern("^[0-9]{4}$")
  taxIdNumber: string;

  @UI.label("4A. Has the Applicant been convicted of a felony criminal violation under any Federal law in the 24 months preceding the date of application?")
  @doc("One selection is required.")
  @UI.widget(Rendering.Widget.Radio)
  felonyConviction: YesNo;

  @UI.label("4B. Does the Applicant have any unpaid Federal tax liability that has been assessed, for which all judicial and administrative remedies have been exhausted or have lapsed, and that is not being paid in a timely manner pursuant to an agreement with the authority responsible for collecting the tax liability?")
  @doc("One selection is required.")
  @UI.widget(Rendering.Widget.Radio)
  unpaidFederalTax: YesNo;
}

/** Source-owned completion values; editable signing is not simulated. */
model Certification {
  @UI.label("5A. APPLICANT'S SIGNATURE (BY)")
  @doc("Completed by Grants.gov upon submission. This is a required field.")
  @UI.readOnly
  signature: Questions.Certifications.Signature;

  @UI.label("5B. TITLE/RELATIONSHIP OF THE INDIVIDUAL IF SIGNING IN A REPRESENTATIVE CAPACITY")
  @doc("Pre-populated from the Application cover sheet. This is a required field.")
  @UI.readOnly
  title: Questions.People.PersonTitle;

  @UI.label("5C. DATE SIGNED (MM-DD-YYYY)")
  @doc("Completed by Grants.gov upon submission. This is a required field.")
  @UI.widget(Rendering.Widget.Text)
  @UI.readOnly
  dateSigned: Questions.Certifications.DateSigned;
}
