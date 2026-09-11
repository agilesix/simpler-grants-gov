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

/** Provide the narrative explaining and supporting the proposed budget. */
@Meta.question(#{ id: "budget/narrative", entity: EntityName.project })
@Meta.tag(TagName.narrative, TagName.money, TagName.attachment)
@UI.label("Budget Narrative")
scalar BudgetNarrative extends AttachmentRef;
