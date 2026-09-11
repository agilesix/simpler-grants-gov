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

/** Cash needed by quarter for the first year. */
@Meta.question(#{
  id: "budget/forecasted-cash-needs",
  entity: EntityName.project,
})
@Meta.tag(TagName.money)
@UI.label("Forecasted Cash Needs")
model QuestionForecastedCashNeeds {
  firstQuarterAmount?: MonetaryAmount;
  secondQuarterAmount?: MonetaryAmount;
  thirdQuarterAmount?: MonetaryAmount;
  fourthQuarterAmount?: MonetaryAmount;

  @Validation.computed(
    Op.Sum,
    QuestionForecastedCashNeeds.firstQuarterAmount,
    QuestionForecastedCashNeeds.secondQuarterAmount,
    QuestionForecastedCashNeeds.thirdQuarterAmount,
    QuestionForecastedCashNeeds.fourthQuarterAmount
  )
  totalAmount?: MonetaryAmount;
}
