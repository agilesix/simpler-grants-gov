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

/** Identify the grant program, function, or activity represented by a budget row. */
@Meta.question(#{ id: "budget/activity-title", entity: EntityName.project })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.title)
@UI.label("Grant program, function, or activity")
@minLength(1)
@maxLength(120)
scalar BudgetActivityTitle extends string;
