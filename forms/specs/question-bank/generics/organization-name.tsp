import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;

namespace QuestionBank.Generics;

/** Enter the legal name of the organization. */
@Meta.question(#{
  id: "generics/organization-name",
  entity: EntityName.generic,
})
@Meta.tag(TagName.organization, TagName.name)
@UI.label("Organization Name")
@minLength(1)
@maxLength(60)
scalar OrganizationName extends string;
