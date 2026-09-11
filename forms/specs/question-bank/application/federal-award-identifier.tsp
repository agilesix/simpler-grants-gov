import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Enter the previously assigned Federal award identifier on the SF-424. */
@Meta.question(#{
  id: "application/federal-award-identifier",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.identifier)
@minLength(1)
@maxLength(25)
scalar Sf424FederalAwardIdentifier extends string;
