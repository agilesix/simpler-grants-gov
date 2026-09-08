import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Select the kind of SF-424 submission being made. */
@Meta.question(#{ id: "application/standard-submission-type", entity: EntityName.application })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.details)
model QuestionSf424SubmissionType {
  /** Select one type of submission in accordance with agency instructions. */
  @UI.label("Submission Type")
  submissionType: Sf424SubmissionType;
}
