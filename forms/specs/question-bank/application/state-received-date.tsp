import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** The date on which a State received an application. */
@Meta.question(#{ id: "application/state-received-date", entity: EntityName.application })
@Meta.role(ResponseRole.systemValue)
@Meta.tag(TagName.date)
@UI.label("State Received Date")
scalar StateReceivedDate extends plainDate;
