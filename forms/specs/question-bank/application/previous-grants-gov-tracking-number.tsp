import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** The previous Grants.gov tracking number for a changed or corrected application. */
@Meta.question(#{
  id: "application/previous-grants-gov-tracking-number",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.identifier)
@UI.label("Grants.gov Identifier")
scalar PreviousGrantsGovTrackingNumber extends string;
