import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/** An email address. */
@Meta.question(#{ id: "generics/email",
  entity: EntityName.generic,
})
@Meta.tag(TagName.email)
@UI.label("Email")
@format("email")
@maxLength(60)
scalar EmailAddress extends string;
