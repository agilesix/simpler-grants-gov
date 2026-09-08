import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;


// Declarations that support this entity's questions without being questions
// themselves -- shared enums, and base models the questions extend.

/** SF-424's exact submission vocabulary. */
enum Sf424SubmissionType {
  preapplication: "Preapplication",
  application: "Application",
  changedCorrected: "Changed/Corrected Application",
}

/** SF-424's application lifecycle vocabulary. */
enum Sf424ApplicationType {
  new: "New",
  continuation: "Continuation",
  revision: "Revision",
}

/** SF-424's encoded revision choices. */
enum Sf424RevisionType {
  A: "A: Increase Award",
  B: "B: Decrease Award",
  C: "C: Increase Duration",
  D: "D: Decrease Duration",
  E: "E: Other (specify)",
  AC: "AC: Increase Award, Increase Duration",
  AD: "AD: Increase Award, Decrease Duration",
  BC: "BC: Decrease Award, Increase Duration",
  BD: "BD: Decrease Award, Decrease Duration",
}

/** SF-424's exact Executive Order 12372 response vocabulary. */
enum Sf424StateReviewCode {
  madeAvailable: "a. This application was made available to the state under the Executive Order 12372 Process for review on",
  notSelected: "b. Program is subject to E.O. 12372 but has not been selected by the state for review.",
  notCovered: "c. Program is not covered by E.O. 12372.",
}
