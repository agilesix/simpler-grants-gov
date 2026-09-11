import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;

namespace QuestionBank.Generics;

/** A telephone or fax number. */
@Meta.question(#{ id: "generics/phone", entity: EntityName.generic })
@Meta.tag(TagName.phone)
@minLength(1)
@maxLength(25)
scalar PhoneNumber extends string;
