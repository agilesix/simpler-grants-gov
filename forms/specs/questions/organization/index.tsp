import "simpler-forms";
import "../index.tsp";
import "../types/address.tsp";

using SimplerForms;

namespace Questions.Organizations;

/** Enter the legal name of the organization. */
@Meta.question(#{ id: "organization/name" })
@Meta.tag(TagName.organization, TagName.name)
@UI.label("Organization Name")
@minLength(1)
@maxLength(60)
scalar OrganizationName extends string;

/** An organization's address. */
@Meta.question(#{ id: "organization/address" })
@UI.label("Address")
model OrganizationAddress is Questions.Types.Address;
