import "simpler-forms";

import "#questions/index.tsp";

using SimplerForms;

// What Grants.gov fills in when an application is submitted. An occurrence marks the field
// read-only and names the API's post-population rule, since both decorators apply only to a
// property.
namespace Questions.Submission;

// `globLib:SignatureDataType`
/** Completed by Grants.gov upon submission. */
@Meta.question(#{ id: "submission/signature" })
@Meta.tag(Catalogue.Tag.name)
@UI.label("Signature")
@minLength(1)
@maxLength(144)
scalar Signature extends string;

// `globLib:DateSignedDataType`, an `xs:date`
/** Completed by Grants.gov upon submission. */
@Meta.question(#{ id: "submission/submitted-date" })
@Meta.tag(Catalogue.Tag.date)
@UI.label("Submitted Date")
scalar SubmittedDate extends plainDate;
