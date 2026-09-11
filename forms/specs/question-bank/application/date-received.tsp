import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Completed by Grants.gov upon submission. */
@Meta.question(#{
  id: "application/date-received",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.systemValue)
@Meta.tag(TagName.date)
@UI.label("Date Received")
scalar DateReceived extends SubmittedDate;
