import "simpler-forms";
import "../index.tsp";

using SimplerForms;

namespace Questions.People;

/** Enter the position title. */
@Meta.question(#{ id: "person/title" })
@Meta.tag(TagName.title)
@UI.label("Title")
@minLength(1)
@maxLength(45)
scalar ContactTitle extends string;
