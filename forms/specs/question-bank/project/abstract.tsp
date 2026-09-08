import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/**
 * Summarize the proposed project in plain language suitable for public release. Do not include
 * personally identifiable, sensitive, or proprietary information.
 */
@Meta.question(#{ id: "project/abstract", entity: EntityName.project })
@Meta.tag(TagName.narrative)
@UI.label("Project Abstract")
@minLength(1)
@maxLength(4000)
scalar ProjectAbstract extends string;
