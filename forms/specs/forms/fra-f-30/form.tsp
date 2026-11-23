import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";

import "#forms/index.tsp";
import "#questions/submission/index.tsp";
import "#questions/types/yes-no.tsp";

import "./examples.tsp";

using SimplerForms;

namespace Forms.FRAF30;

// The data only: how an applicant is shown it is `FRAF30Layout`, in layout.tsp.
/** FRA F 30, Grants.gov version 1.0. */
@Meta.form(#{ id: "fra-f-30", formName: "FRA F 30" })
@GrantsGov.form(#{
  legacyFormId: 648,
  shortFormName: "FRA",
  formVersion: "1.0",
  agencyCode: "SGG",
  ombNumber: "2130-0615",
  expirationDate: "2028-01-31",
})
@example(Examples.twoPlaces, #{ title: "Two places of performance" })
@example(Examples.noPlaces, #{ title: "No places of performance" })
model FRAF30 {
  // The XSD numbers three elements, `PlaceofPerformance1` to `3`, which xsd.tsp fills from
  // the list's items.
  /** Enter up to three places of performance, one per line. */
  @UI.label("Place of Performance (Street address, city, county, state, zip code)")
  @maxItems(3)
  placesOfPerformance?: PlaceOfPerformance[];

  /** Check if there are workplaces on file that are not identified here. */
  @UI.label("Check if there are workplaces on file that are not identified here.")
  @UI.widget(Rendering.Widget.Checkbox)
  workplacesNotIdentified?: Questions.Types.YesNo;

  /** Check if applicable certification is for the award of a grant or cooperative agreement exceeding $100,000 or a federal loan exceeding $150,000. */
  @UI.label("Check if applicable certification is for the award of a grant or cooperative agreement exceeding $100,000 or a federal loan exceeding $150,000")
  @UI.widget(Rendering.Widget.Checkbox)
  exceedsLobbyingThreshold?: Questions.Types.YesNo;

  @UI.label("Signature of Authorized Certifying Official")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  signature?: Questions.Submission.Signature;

  /** Enter the name and title of the official certifying that the certifications in Parts A, B, and C (if C is applicable) are true. This field is required. */
  @UI.label("Typed Name and Title")
  @minLength(1)
  @maxLength(200)
  nameAndTitle: string;

  @UI.label("Date")
  @UI.readOnly
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  dateSigned?: Questions.Submission.SubmittedDate;
}

// `FRA_POPDataType`, which allows an empty line. An entry in the list is a line the
// applicant fills in, so it needs at least one character.
/** One place of performance: a street address, city, county, state and zip code. */
@minLength(1)
@maxLength(200)
scalar PlaceOfPerformance extends string;
