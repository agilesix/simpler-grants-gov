import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** UEI of the applicant organization. */
@Meta.question(#{ id: "primary-org/uei", entity: EntityName.primaryOrg })
@Meta.tag(TagName.identifier, TagName.organization)
@UI.label("SAM UEI")
@minLength(12)
@maxLength(12)
scalar SamUei extends string;
