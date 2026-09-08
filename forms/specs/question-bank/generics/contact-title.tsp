import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/** Enter the position title. */
@Meta.question(#{ id: "generics/contact-title",
  entity: EntityName.generic,
})
@Meta.tag(TagName.title)
@UI.label("Title")
@minLength(1)
@maxLength(45)
scalar ContactTitle extends string;
