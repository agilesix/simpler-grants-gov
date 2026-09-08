import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Enter either TIN or EIN as assigned by the Internal Revenue Service. */
@Meta.question(#{ id: "primary-org/ein", entity: EntityName.primaryOrg })
@Meta.tag(TagName.identifier, TagName.organization)
@UI.label("EIN/TIN")
@minLength(9)
@maxLength(30)
scalar EmployerIdentificationNumber extends string;
