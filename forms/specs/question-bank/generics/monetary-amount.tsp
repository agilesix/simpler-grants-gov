import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/**
 * A dollar amount. Held as a string rather than a number so that a cent is never lost to
 * binary floating point.
 */
@Meta.question(#{ id: "generics/monetary-amount",
  entity: EntityName.generic,
})
@Meta.tag(TagName.money)
@pattern("^(-)?\\d*([.]\\d{2})?$")
@minLength(1)
@maxLength(14)
scalar MonetaryAmount extends string;

/**
 * A dollar amount that cannot be negative, up to 999,999,999,999.99.
 *
 * A separate question rather than a constraint on `MonetaryAmount` because the two ask
 * different things, which is how Simpler Grants already models it -- `common_shared.py`
 * carries `budget_monetary_amount` alongside two non-negative siblings.
 *
 * Named for its range rather than for the kind of cell it appears in. The bound that
 * matters comes from the Grants.gov element a field maps to, so a question named for its
 * range can be reused by anything mapping to an element with that maximum, while one named
 * for its role needs a new sibling whenever a form's XSD caps it differently.
 */
@Meta.question(#{ id: "generics/monetary-amount-max-12-digits",
  entity: EntityName.generic,
})
@Meta.tag(TagName.money)
@pattern("^\\d{1,12}([.]\\d{2})?$")
@minLength(1)
@maxLength(15)
scalar MonetaryAmountMax12Digits extends string;

/**
 * A dollar amount that cannot be negative, up to 9,999,999,999,999.99.
 *
 * One digit wider than `MonetaryAmountMax12Digits`, for a total that has to hold the sum of
 * fields constrained to that.
 */
@Meta.question(#{ id: "generics/monetary-amount-max-13-digits",
  entity: EntityName.generic,
})
@Meta.tag(TagName.money)
@pattern("^\\d{1,13}([.]\\d{2})?$")
@minLength(1)
@maxLength(16)
scalar MonetaryAmountMax13Digits extends string;
