import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Record whether and when the SF-424 was made available for State review. */
@Meta.question(#{ id: "application/standard-state-review", entity: EntityName.application })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.details, TagName.date)
model QuestionSf424StateReview {
  /** One selection is required. */
  @UI.label("Is Application Subject to Review By State Under Executive Order 12372 Process?")
  stateReview: Sf424StateReviewCode;

  /** If 'a' is selected, enter the date the application was submitted to the State. */
  @UI.label("State Review Date")
  @Validation.requiredWhen(QuestionSf424StateReview.stateReview, Sf424StateReviewCode.madeAvailable)
  stateReviewAvailableDate?: plainDate;
}
