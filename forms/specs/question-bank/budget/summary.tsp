import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

/**
 * The five budget tables of SF-424A, each a question in its own right. Every one is asked
 * twice on that form -- once per activity and once as a total -- and the budget family
 * asks several of them again.
 *
 * Where a table's own arithmetic is intrinsic to it, it is declared here rather than on
 * the forms: a direct-charge subtotal is the sum of the object-class categories no matter
 * which form is asking.
 */
namespace QuestionBank.Budget;

/** Estimated unobligated and new or revised funds, federal and non-federal. */
@Meta.question(#{ id: "budget/summary",
  entity: EntityName.project,
})
@Meta.tag(TagName.money)
@UI.label("Budget Summary")
model QuestionBudgetSummary {
  @UI.label("Estimated unobligated federal funds")
  @UI.helpText("Federal funds authorized under an award that have not yet been obligated. Enter an amount only when the application instructions require it.")
  federalEstimatedUnobligatedAmount?: MonetaryAmount;

  @UI.label("Estimated unobligated non-federal funds")
  @UI.helpText("Non-federal funds required under an award that have not yet been obligated or used. Enter an amount only when the application instructions require it.")
  nonFederalEstimatedUnobligatedAmount?: MonetaryAmount;

  @UI.label("New or revised federal budget")
  @UI.helpText("Enter federal funds needed for the upcoming period. For a supplemental application, enter the additional amount requested. For a change, enter the increase or decrease.")
  federalNewOrRevisedAmount?: MonetaryAmount;

  @UI.label("New or revised non-federal budget")
  @UI.helpText("Enter the non-federal share for the upcoming period. For a supplemental application, enter the additional contribution. For a change, enter the increase or decrease.")
  nonFederalNewOrRevisedAmount?: MonetaryAmount;

  @UI.label("Total")
  @UI.helpText("Enter the total budgeted amount for this row. This value is not calculated automatically.")
  totalAmount?: MonetaryAmount;
}
