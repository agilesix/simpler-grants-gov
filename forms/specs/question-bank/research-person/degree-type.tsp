import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/** Enter the type of degree held by the research person. */
@Meta.question(#{
  id: "research-person/degree-type",
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.details)
@UI.label("Degree Type")
@minLength(1)
@maxLength(75)
scalar ResearchPersonDegreeType extends string;
