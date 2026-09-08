import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/** Completed by Grants.gov upon submission. */
@Meta.question(#{ id: "generics/submitted-date", entity: EntityName.generic })
@Meta.role(ResponseRole.systemValue)
@Meta.tag(TagName.date)
@UI.label("Submitted Date")
scalar SubmittedDate extends plainDate;
