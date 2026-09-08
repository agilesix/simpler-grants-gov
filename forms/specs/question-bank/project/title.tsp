import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Enter a brief, descriptive title of the project. */
@Meta.question(#{ id: "project/title", entity: EntityName.project })
@Meta.tag(TagName.title)
@UI.label("Project Title")
@minLength(1)
scalar ProjectTitle extends string;
