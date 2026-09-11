import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** The identifier assigned by a State to an application. */
@Meta.question(#{
  id: "application/state-application-identifier",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.systemValue)
@Meta.tag(TagName.identifier)
@UI.label("State Application Identifier")
scalar StateApplicationIdentifier extends string;
