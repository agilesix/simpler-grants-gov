import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

// A string, not a year: the XSD types it as free text, and a form that has accepted "1998-99"
// for twenty years should not start rejecting it here.
/** Enter the year in which the research person's degree was awarded. */
@Meta.question(#{
  id: "research-person/degree-year",
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.date)
@UI.label("Degree Year")
@minLength(1)
@maxLength(25)
scalar ResearchPersonDegreeYear extends string;
