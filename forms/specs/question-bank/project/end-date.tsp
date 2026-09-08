import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Enter the date in the format MM/DD/YYYY. */
@Meta.question(#{ id: "project/end-date", entity: EntityName.project })
@Meta.tag(TagName.date)
@UI.label("Project End Date")
scalar ProjectEndDate extends plainDate;
