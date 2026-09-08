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

/** Explain the indirect rate, its base, and the resulting indirect expense. */
@Meta.question(#{ id: "budget/indirect-charges-explanation", entity: EntityName.project })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.money, TagName.narrative)
@UI.label("Indirect Charges")
@minLength(1)
@maxLength(50)
scalar IndirectChargesExplanation extends string;
