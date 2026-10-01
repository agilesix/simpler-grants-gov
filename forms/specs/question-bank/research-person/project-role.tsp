import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/**
 * The roles the R&R forms recognize for a senior or key person.
 *
 * A closed list, unlike `poc/project-role`, which the Key Contacts form asks as free text.
 * Two forms asking "what is this person's role" and meaning different things by the answer.
 */
enum ResearchProjectRole {
  projectDirectorPrincipalInvestigator: "PD/PI",
  coProjectDirectorPrincipalInvestigator: "Co-PD/PI",
  faculty: "Faculty",
  postDoctoral: "Post Doctoral",
  postDoctoralAssociate: "Post Doctoral Associate",
  postDoctoralScholar: "Post Doctoral Scholar",
  otherProfessional: "Other Professional",
  graduateStudent: "Graduate Student",
  undergraduateStudent: "Undergraduate Student",
  technician: "Technician",
  consultant: "Consultant",
  coInvestigator: "Co-Investigator",
  other: "Other (Specify)",
}
