import "simpler-forms";
import "../index.tsp";
import "../types/address.tsp";
import "../types/codes.tsp";
import "../types/contact-info.tsp";
import "./name.tsp";
import "./title.tsp";

using SimplerForms;

namespace Questions.People;

/** A person's address. */
@Meta.question(#{ id: "person/address" })
@UI.label("Address")
model PersonAddress is Questions.Types.Address;

/**
 * A person and how to reach them: `globLib:ContactPersonDataTypeV3`.
 *
 * Used as-is wherever a form asks for a contact person whose role is given by where the
 * person sits in the form (e.g. EPA's Payee). A role that adds fields of its own, like a
 * key contact's project role, is a separate question that spreads this one.
 */
@Meta.question(#{ id: "person" })
@Meta.tag(TagName.person, TagName.details)
@UI.label("Contact Person")
@example(Questions.People.Examples.usContact)
model Person {
  /** Enter the contact's name. First and last name are required. */
  @UI.label("Name")
  @Validation.requiredPaths("firstName", "lastName")
  name: Questions.People.PersonName;

  /** Enter the contact's position title. */
  @UI.label("Title")
  title?: Questions.People.ContactTitle;

  /** Enter the contact's complete address. */
  @UI.label("Address")
  @Validation.requiredPaths("street1", "city", "country")
  @Validation.requiredPathWhen("state", "country", Questions.Types.CountryCode.USA)
  @Validation.requiredPathWhen("zipCode", "country", Questions.Types.CountryCode.USA)
  address: Questions.People.PersonAddress;

  /** Enter the contact's phone, fax and email. Phone is required. */
  @UI.label("Contact Information")
  @Validation.requiredPaths("phone")
  contact: Questions.Types.ContactInfo;
}

/** Sample people, type-checked against `Person` and reused by the forms' examples. */
namespace Examples {
  const usContact: Questions.People.Person = #{
    name: #{ prefix: "Ms.", firstName: "Alicia", lastName: "Reyes" },
    title: "Executive Director",
    address: #{
      street1: "100 Grant Avenue",
      city: "Denver",
      state: Questions.Types.StateCode.CO,
      zipCode: "80202-1234",
      country: Questions.Types.CountryCode.USA,
    },
    contact: #{ phone: "3035550100", email: "alicia.reyes@example.org" },
  };

  const usContactNoEmail: Questions.People.Person = #{
    name: #{ firstName: "Marcus", lastName: "Lee" },
    title: "Controller",
    address: #{
      street1: "100 Grant Avenue",
      street2: "Suite 400",
      city: "Denver",
      state: Questions.Types.StateCode.CO,
      zipCode: "80202-1234",
      country: Questions.Types.CountryCode.USA,
    },
    contact: #{ phone: "3035550101", fax: "3035550199" },
  };

  const internationalContact: Questions.People.Person = #{
    name: #{ prefix: "Dr.", firstName: "Tom", lastName: "Okafor", suffix: "PhD" },
    title: "Lead Scientist",
    address: #{
      street1: "456 Rio",
      city: "Montevideo",
      province: "Montevideo",
      country: Questions.Types.CountryCode.URY,
    },
    contact: #{ phone: "1234567890", email: "tom.okafor@example.edu" },
  };
}
