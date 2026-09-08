import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/**
 * An email address.
 *
 * `globLib:EmailDataType` is minLength 1, maxLength 60, so both bounds are declared here.
 * `format: email` already rejects the empty string, which makes the minimum redundant in
 * practice -- but the constraint the Grants.gov type states should be stated, not left to
 * follow from another assertion that could be relaxed independently.
 */
@Meta.question(#{ id: "generics/email",
  entity: EntityName.generic,
})
@Meta.tag(TagName.email)
@UI.label("Email")
@format("email")
@minLength(1)
@maxLength(60)
scalar EmailAddress extends string;
