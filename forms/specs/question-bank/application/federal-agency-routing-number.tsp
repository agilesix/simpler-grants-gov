import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** The routing identifier assigned by the Federal agency for an R&R application. */
@Meta.question(#{
  id: "application/federal-agency-routing-number",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.identifier)
@UI.label("Agency Routing Number")
scalar FederalAgencyRoutingNumber extends string;
