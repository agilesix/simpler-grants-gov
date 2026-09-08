import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

/**
 * What forms ask about the representative authorized to submit on the organization's behalf.
 *
 * These extend the generic shapes rather than being them, because a shape is not a question.
 * `generics/contact-title` says what a title looks like; `aor/title` is a thing a form asks
 * for, and it is the same thing whichever form asks -- which is what lets the bank answer
 * "which forms need an authorized representative's title" and what stops two forms declaring
 * it separately and drifting.
 *
 * The representative signs, and their signature carries the certification in 18 U.S.C. 1001,
 * so they are not interchangeable with a point of contact even where the shapes agree.
 */
namespace QuestionBank.Aor;

/** Enter the daytime Telephone Number. */
@Meta.question(#{ id: "aor/phone", entity: EntityName.authorizedRepresentative })
@Meta.tag(TagName.phone)
@UI.label("Telephone Number")
scalar AorPhone extends PhoneNumber;
