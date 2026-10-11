import "simpler-forms";
import "../index.tsp";
import "../organization/index.tsp";
import "./index.tsp";

using SimplerForms;

namespace Questions.People;

/** Enter the key contact's free-text role on this project. */
@Meta.question(#{ id: "person/key-contact/project-role" })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.person, TagName.role)
@minLength(1)
@maxLength(45)
scalar ProjectRole extends string;

/**
 * A key contact's role: their position title, plus their role on the project and the
 * organization they belong to. The XSD keeps these three beside the contact's name.
 */
@Meta.question(#{ id: "person/key-contact/role" })
@Meta.tag(TagName.person, TagName.role)
@UI.label("Role")
@UI.order(
  KeyContactRole.projectRole,
  KeyContactRole.title,
  KeyContactRole.organizationalAffiliation
)
model KeyContactRole {
  /** Enter the individual's role on the project (e.g., project manager, fiscal contact). */
  @UI.label("Project Role")
  projectRole: Questions.People.ProjectRole;

  ...Questions.People.PersonRole;

  /** Enter the contact's organizational affiliation. */
  @UI.label("Organizational Affiliation")
  organizationalAffiliation?: Questions.Organizations.OrganizationName;
}

/**
 * A contact person named for their role on the project (Key Contacts `RoleOnProject`).
 *
 * The same globLib leaves as `Person`, with a fuller role, and the email is required.
 */
@Meta.question(#{ id: "person/key-contact" })
@Meta.tag(TagName.person, TagName.role)
@UI.label("Key Contact")
@example(Questions.People.Examples.principalInvestigator)
@UI.order(KeyContact.role, KeyContact.name, KeyContact.address, KeyContact.contact)
model KeyContact {
  /** Enter the contact's role on the project, title and organizational affiliation. */
  @UI.label("Role")
  role: Questions.People.KeyContactRole;

  ...OmitProperties<Questions.People.Person, "contact" | "role">;

  // Redeclared rather than tightened with a model-level `@Validation.requiredPaths("contact.email")`:
  // in simpler-forms 0.1.0-alpha.1 that replaces the model's `required` list instead of adding to it.
  // TODO: switch to the model-level decorator once
  // https://github.com/agilesix/simpler-forms/issues/5 is released.
  /** Enter the contact's phone, fax and email. Phone and email are required. */
  @UI.label("Contact Information")
  @Validation.requiredPaths("phone", "email")
  contact: Questions.Types.ContactInfo;
}

/** Sample key contacts, type-checked against `KeyContact` and reused by the form's example. */
namespace Examples {
  const principalInvestigator: Questions.People.KeyContact = #{
    role: #{
      projectRole: "Principal Investigator",
      title: "Director",
      organizationalAffiliation: "Acme University",
    },
    name: #{
      prefix: "Doctor",
      firstName: "Sue",
      middleName: "Sally",
      lastName: "Storm",
      suffix: "Esquire",
    },
    address: #{
      street1: "123 Main Street",
      street2: "Apt 123",
      city: "Placeville",
      state: Questions.Types.StateCode.WY,
      zipCode: "56789-1234",
      country: Questions.Types.CountryCode.USA,
    },
    contact: #{ phone: "1234567890", fax: "1112223333", email: "example@example.com" },
  };

  const projectManager: Questions.People.KeyContact = #{
    role: #{ projectRole: "Project Manager" },
    name: #{ firstName: "Joe", lastName: "Smithers" },
    address: #{
      street1: "456 Rio",
      city: "Montevideo",
      province: "Montevideo",
      country: Questions.Types.CountryCode.URY,
    },
    contact: #{ phone: "1234567890", email: "person@place.com" },
  };
}
