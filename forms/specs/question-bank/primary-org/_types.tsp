import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;


// Declarations that support this entity's questions without being questions
// themselves -- shared enums, and base models the questions extend.

// Both SF-424 and SF-424-Short ask this with the same twenty-four codes and the same
// cardinality. The list is shared; the wording and the "other" box stay with each form,
// because the forms word them differently.
@summary("Type of Applicant")
@doc("The applicant's category, from the Executive Order 12372 list.")
enum ApplicantTypeCode {
  A: "A: State Government",
  B: "B: County Government",
  C: "C: City or Township Government",
  D: "D: Special District Government",
  E: "E: Regional Organization",
  F: "F: U.S. Territory or Possession",
  G: "G: Independent School District",
  H: "H: Public/state Controlled Institution of Higher Education",
  I: "I: Indian/Native American Tribal Government (Federally Recognized)",
  J: "J: Indian/Native American Tribal Government (Other than Federally Recognized)",
  K: "K: Indian/Native American Tribally Designated Organization",
  L: "L: Public/Indian Housing Authority",
  M: "M: Nonprofit with 501C3 IRS Status (Other than Institution of Higher Education)",
  N: "N: Nonprofit without 501C3 IRS Status (Other than Institution of Higher Education)",
  O: "O: Private Institution of Higher Education",
  P: "P: Individual",
  Q: "Q: For-Profit Organization (Other than Small Business)",
  R: "R: Small Business",
  S: "S: Hispanic-serving Institution",
  T: "T: Historically Black Colleges and Universities (HBCUs)",
  U: "U: Tribally Controlled Colleges and Universities (TCCUs)",
  V: "V: Alaska Native and Native Hawaiian Serving Institutions",
  W: "W: Non-domestic (non-US) Entity",
  X: "X: Other (specify)",
}
