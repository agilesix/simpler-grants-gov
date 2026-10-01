import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/** The prefixes the R&R forms offer, as a closed list rather than free text. */
enum ResearchPersonPrefix {
  mr: "Mr.",
  mrs: "Mrs.",
  miss: "Miss",
  ms: "Ms.",
  doctor: "Dr.",
  reverend: "Rev.",
  professor: "Prof.",
}

/** The suffixes the R&R forms offer, as a closed list rather than free text. */
enum ResearchPersonSuffix {
  junior: "Jr.",
  senior: "Sr.",
  medicalDoctor: "M.D.",
  doctorOfPhilosophy: "Ph.D",
  jurisDoctor: "JD",
}

// Not `generics/person-name` with a narrower prefix: the R&R forms enumerate the prefixes and
// suffixes they accept, and the generic name leaves both as free text. The two are the same
// five parts asked with different rules, which makes them different questions.
/** Enter the research person's name as it appears in official records. */
@Meta.question(#{
  id: "research-person/name",
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.name)
@UI.label("Name")
model QuestionResearchPersonName {
  /** Enter the Prefix. */
  @UI.label("Prefix")
  prefix?: ResearchPersonPrefix;

  /** Enter the First Name. */
  @UI.label("First Name")
  @minLength(1)
  @maxLength(35)
  firstName: string;

  /** Enter the Middle Name. */
  @UI.label("Middle Name")
  @minLength(1)
  @maxLength(25)
  middleName?: string;

  /** Enter the Last Name. */
  @UI.label("Last Name")
  @minLength(1)
  @maxLength(60)
  lastName: string;

  /** Enter the Suffix. */
  @UI.label("Suffix")
  suffix?: ResearchPersonSuffix;
}
