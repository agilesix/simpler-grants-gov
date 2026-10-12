import "simpler-forms";
import "../index.tsp";
import "../types/address.tsp";
import "../types/codes.tsp";
import "../types/contact-info.tsp";
import "./name.tsp";
import "./title.tsp";
import "../../mapping/targets.tsp";
import "../../xsd/global-library.tsp";

using SimplerForms;

namespace Questions.People;

/** A person's address. */
@Meta.question(#{ id: "person/address" })
@UI.label("Address")
model PersonAddress is Questions.Types.Address;

/** Enter the daytime Telephone Number. */
@Meta.question(#{ id: "person/phone-number" })
@Meta.tag(TagName.person, TagName.phone)
@UI.label("Phone Number")
scalar PersonPhoneNumber extends Questions.Types.PhoneNumber;

/** Enter the Fax Number. */
@Meta.question(#{ id: "person/fax-number" })
@Meta.tag(TagName.person, TagName.phone)
@UI.label("Fax Number")
scalar PersonFaxNumber extends Questions.Types.PhoneNumber;

/** Enter a valid email Address. */
@Meta.question(#{ id: "person/email" })
@Meta.tag(TagName.person, TagName.email)
@UI.label("Email")
scalar PersonEmail extends Questions.Types.EmailAddress;

/**
 * A person and how to reach them: `globLib:ContactPersonDataTypeV3`.
 *
 * Used as-is wherever a form asks for a contact person whose role is given by where the
 * person sits in the form (e.g. EPA's Payee). A role that adds fields of its own, like a
 * key contact's project role, is a separate question that spreads this one.
 */
@Meta.question(#{ id: "person" })
@Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3)
@Meta.tag(TagName.person, TagName.details)
@UI.label("Contact Person")
@example(Questions.People.Examples.usContact)
model Person {
  /** Enter the contact's name. First and last name are required. */
  @UI.label("Name")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3.name)
  name: Questions.People.PersonName;

  /** Enter the contact's position title. */
  @UI.label("Title")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3.title)
  title?: Questions.People.PersonTitle;

  /** Enter the contact's complete address. */
  @UI.label("Address")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3.address)
  address: Questions.People.PersonAddress;

  // `ContactPersonDataTypeV3` makes the phone optional; the forms that ask for a contact
  // person require it.
  /** Enter the daytime Telephone Number. */
  @UI.label("Phone Number")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3.phone)
  phone: Questions.People.PersonPhoneNumber;

  /** Enter the Fax Number. */
  @UI.label("Fax Number")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3.fax)
  fax?: Questions.People.PersonFaxNumber;

  /** Enter a valid email Address. */
  @UI.label("Email")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.ContactPersonDataTypeV3.email)
  email?: Questions.People.PersonEmail;
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
    phone: "3035550100",
    email: "alicia.reyes@example.org",
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
    phone: "3035550101",
    fax: "3035550199",
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
    phone: "1234567890",
    email: "tom.okafor@example.edu",
  };
}
