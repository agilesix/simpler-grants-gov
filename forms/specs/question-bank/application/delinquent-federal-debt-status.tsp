import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Report whether the SF-424 applicant is delinquent on Federal debt. */
@Meta.question(#{
  id: "application/delinquent-federal-debt-status",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.details)
model QuestionFederalDebtStatus {
  /** If 'Yes,' provide explanation in attachment. */
  @UI.label("Applicant Delinquent on Federal Debt")
  @UI.widget(WidgetName.Radio)
  delinquentFederalDebt: boolean;
}
