import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;

namespace QuestionBank.Generics;

/** Completed by Grants.gov upon submission. */
@Meta.question(#{ id: "generics/signature", entity: EntityName.generic })
@Meta.tag(TagName.person, TagName.name)
@UI.label("Signature")
@minLength(1)
@maxLength(144)
scalar Signature extends string;
