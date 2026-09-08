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
