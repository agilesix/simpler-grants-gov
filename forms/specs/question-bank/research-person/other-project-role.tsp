import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./project-role.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/** Specify the research person's project role when an Other role is selected. */
@Meta.question(#{
  id: "research-person/other-project-role",
  entity: EntityName.principalInvestigator,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.person, TagName.role)
@UI.label("Other Project Role Category")
@minLength(1)
@maxLength(40)
scalar ResearchPersonOtherProjectRole extends string;
