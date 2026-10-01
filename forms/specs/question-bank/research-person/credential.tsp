import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/** Enter the research person's agency credential or login, when applicable. */
@Meta.question(#{
  id: "research-person/credential",
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.identifier)
@UI.label("Credential, e.g., agency login")
@minLength(1)
@maxLength(60)
scalar ResearchPersonCredential extends string;
