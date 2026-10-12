import "simpler-forms";

import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "#questions/person/index.tsp";

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
model KeyContact {
  /** Enter the individual's role on the project (e.g., project manager, fiscal contact). */
  @UI.label("Project Role")
  projectRole: Forms.KeyContacts.ProjectRole;

  /** Enter the contact's name. First and last name are required. */
  @UI.label("Name")
  name: Questions.People.PersonName;

  /** Enter the contact's position title. */
  @UI.label("Title")
  title?: Questions.People.PersonTitle;

  /** Enter the contact's organizational affiliation. */
  @UI.label("Organizational Affiliation")
  organizationalAffiliation?: Questions.Organizations.OrgName;

  /** Enter the contact's complete address. */
  @UI.label("Address")
  address: Questions.People.PersonAddress;

  /** Enter the daytime Telephone Number. */
  @UI.label("Phone Number")
  phone: Questions.People.PersonPhoneNumber;

  /** Enter the Fax Number. */
  @UI.label("Fax Number")
  fax?: Questions.People.PersonFaxNumber;

  /** Enter a valid email Address. */
  @UI.label("Email")
  email: Questions.People.PersonEmail;
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
