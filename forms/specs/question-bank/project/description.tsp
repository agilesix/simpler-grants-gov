import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Enter a brief description of the proposed project. */
@Meta.question(#{ id: "project/description", entity: EntityName.project })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.narrative)
@UI.label("Project Description")
@minLength(1)
@maxLength(1000)
scalar ProjectDescription extends string;
