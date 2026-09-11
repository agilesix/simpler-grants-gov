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

/** Funds required for each object class category. */
@Meta.question(#{ id: "budget/categories", entity: EntityName.project })
@Meta.tag(TagName.money)
@UI.label("Budget Categories")
model QuestionBudgetCategories {
  personnelAmount?: MonetaryAmount;
  fringeBenefitsAmount?: MonetaryAmount;
  travelAmount?: MonetaryAmount;
  equipmentAmount?: MonetaryAmount;
  suppliesAmount?: MonetaryAmount;
  contractualAmount?: MonetaryAmount;
  constructionAmount?: MonetaryAmount;
  otherAmount?: MonetaryAmount;

  @Validation.computed(
    Op.Sum,
    QuestionBudgetCategories.personnelAmount,
    QuestionBudgetCategories.fringeBenefitsAmount,
    QuestionBudgetCategories.travelAmount,
    QuestionBudgetCategories.equipmentAmount,
    QuestionBudgetCategories.suppliesAmount,
    QuestionBudgetCategories.contractualAmount,
    QuestionBudgetCategories.constructionAmount,
    QuestionBudgetCategories.otherAmount
  )
  totalDirectChargeAmount?: MonetaryAmount;

  totalIndirectChargeAmount?: MonetaryAmount;

  @Validation.computed(
    Op.Sum,
    QuestionBudgetCategories.totalDirectChargeAmount,
    QuestionBudgetCategories.totalIndirectChargeAmount
  )
  totalAmount?: MonetaryAmount;

  programIncomeAmount?: MonetaryAmount;
}
