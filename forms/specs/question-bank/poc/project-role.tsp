import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Poc;

/** Enter the key contact's free-text role on this project. */
@Meta.question(#{ id: "poc/project-role", entity: EntityName.poc })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.person, TagName.role)
@UI.label("Project Role")
@minLength(1)
@maxLength(45)
scalar KeyContactProjectRole extends string;
