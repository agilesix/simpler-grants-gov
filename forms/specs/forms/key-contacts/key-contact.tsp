import "simpler-forms";
import "../index.tsp";
import "../../questions/organization/index.tsp";
import "../../questions/person/index.tsp";
import "../../mapping/targets.tsp";
import "../../xsd/key-contacts-2-0.tsp";

using SimplerForms;

namespace Forms.KeyContacts;

/** Enter the key contact's free-text role on this project. */
@Meta.question(#{ id: "person/key-contact/project-role" })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.person, TagName.role)
@minLength(1)
@maxLength(45)
scalar ProjectRole extends string;

/**
 * A contact person named for their role on the project: Key Contacts `RoleOnProject`.
 *
 * The same questions as `Person`, plus a free-text role and an affiliation, and the email is
 * required. Fields are declared in the order the form asks them.
 */
@Meta.question(#{ id: "person/key-contact" })
@Meta.tag(TagName.person, TagName.role)
@UI.label("Key Contact")
@example(Forms.KeyContacts.Examples.principalInvestigator)
@Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject)
model KeyContact {
  /** Enter the individual's role on the project (e.g., project manager, fiscal contact). */
  @UI.label("Project Role")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactProjectRole)
  projectRole: Forms.KeyContacts.ProjectRole;

  /** Enter the contact's name. First and last name are required. */
  @UI.label("Name")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactName)
  name: Questions.People.PersonName;

  /** Enter the contact's position title. */
  @UI.label("Title")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactTitle)
  title?: Questions.People.ContactTitle;

  /** Enter the contact's organizational affiliation. */
  @UI.label("Organizational Affiliation")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactOrganizationalAffiliation)
  organizationalAffiliation?: Questions.Organizations.OrganizationName;

  /** Enter the contact's complete address. */
  @UI.label("Address")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactAddress)
  address: Questions.People.PersonAddress;

  /** Enter the daytime Telephone Number. */
  @UI.label("Phone Number")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactPhone)
  phone: Questions.Types.PhoneNumber;

  /** Enter the Fax Number. */
  @UI.label("Fax Number")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactFax)
  fax?: Questions.Types.PhoneNumber;

  /** Enter a valid email Address. */
  @UI.label("Email")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.RoleOnProject.contactEmail)
  email: Questions.Types.EmailAddress;
}

/** Sample key contacts, type-checked against `KeyContact` and reused by the form's example. */
namespace Examples {
  const principalInvestigator: Forms.KeyContacts.KeyContact = #{
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
    phone: "1234567890",
    fax: "1112223333",
    email: "example@example.com",
  };

  const projectManager: Forms.KeyContacts.KeyContact = #{
    projectRole: "Project Manager",
    name: #{ firstName: "Joe", lastName: "Smithers" },
    address: #{
      street1: "456 Rio",
      city: "Montevideo",
      province: "Montevideo",
      country: Questions.Types.CountryCode.URY,
    },
    phone: "1234567890",
    email: "person@place.com",
  };
}
