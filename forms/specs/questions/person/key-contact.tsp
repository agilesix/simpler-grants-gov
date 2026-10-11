import "simpler-forms";
import "../index.tsp";
import "../organization/index.tsp";
import "./index.tsp";
import "../../mapping/targets.tsp";
import "../../xsd/key-contacts-2-0.tsp";

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
 * A contact person named for their role on the project (Key Contacts `RoleOnProject`).
 *
 * The same globLib leaves as `Person`, plus a free-text role and an affiliation, and the
 * email is required.
 */
@Meta.question(#{ id: "person/key-contact" })
@Meta.tag(TagName.person, TagName.role)
@UI.label("Key Contact")
@example(Questions.People.Examples.principalInvestigator)
// `name`, `title` and `address` come from `Person` by spread, so their links are declared here.
// `contact` has no element of its own in `RoleOnProject`: its fields are flattened into it.
@Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject)
@Mapping.path(Mappings.Target.grantsGovXml, "name", XSD.KeyContacts20.RoleOnProject.contactName)
@Mapping.path(Mappings.Target.grantsGovXml, "title", XSD.KeyContacts20.RoleOnProject.contactTitle)
@Mapping.path(Mappings.Target.grantsGovXml, "address", XSD.KeyContacts20.RoleOnProject.contactAddress)
@Mapping.path(Mappings.Target.grantsGovXml, "contact.phone", XSD.KeyContacts20.RoleOnProject.contactPhone)
@Mapping.path(Mappings.Target.grantsGovXml, "contact.fax", XSD.KeyContacts20.RoleOnProject.contactFax)
@Mapping.path(Mappings.Target.grantsGovXml, "contact.email", XSD.KeyContacts20.RoleOnProject.contactEmail)
@UI.order(
  KeyContact.projectRole,
  KeyContact.name,
  KeyContact.title,
  KeyContact.organizationalAffiliation,
  KeyContact.address,
  KeyContact.contact
)
model KeyContact {
  /** Enter the individual's role on the project (e.g., project manager, fiscal contact). */
  @UI.label("Project Role")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactProjectRole)
  projectRole: Questions.People.ProjectRole;

  ...OmitProperties<Questions.People.Person, "contact">;

  /** Enter the contact's organizational affiliation. */
  @UI.label("Organizational Affiliation")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactOrganizationalAffiliation)
  organizationalAffiliation?: Questions.Organizations.OrganizationName;

  // Redeclared rather than tightened with a model-level `@Validation.requiredPaths("contact.email")`:
  // in simpler-forms 0.1.0-alpha.1 that replaces the model's `required` list instead of adding to it.
  // TODO: switch to the model-level decorator once
  // https://github.com/agilesix/simpler-forms/issues/5 is released.
  /** Enter the contact's phone, fax and email. Phone and email are required. */
  @UI.label("Contact Information")
  @UI.widget(Rendering.Widget.CollapsibleFieldset)
  @Validation.requiredPaths("phone", "email")
  contact: Questions.Types.ContactInfo;
}

/** Sample key contacts, type-checked against `KeyContact` and reused by the form's example. */
namespace Examples {
  const principalInvestigator: Questions.People.KeyContact = #{
    projectRole: "Principal Investigator",
    name: #{
      prefix: "Doctor",
      firstName: "Sue",
      middleName: "Sally",
      lastName: "Storm",
      suffix: "Esquire",
    },
    title: "Director",
    organizationalAffiliation: "Acme University",
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
    projectRole: "Project Manager",
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
