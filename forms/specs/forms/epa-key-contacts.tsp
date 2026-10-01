import "simpler-forms";
import "simpler-forms-sgg";
import "./index.tsp";
import "../question-bank/generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace Forms.EPAKeyContacts;

/** Fixed EPA contact roles, in official paper-form order. */
enum EPAKeyContactsSection {
  authorizedRepresentative: "Authorized Representative",
  payee: "Payee",
  administrativeContact: "Administrative Contact",
  projectManager: "Project Manager",
}

/**
 * One source-defined EPA contact person.
 *
 * Not `poc/details`, which requires an email and is asked as a list. EPA asks for four named
 * roles, each optional as a whole, and each complete once it exists: first and last name,
 * street 1, city, country and phone become required the moment any part of the role is
 * answered, while email stays optional throughout. That completeness boundary is the whole
 * shape of this question, and it is the one thing `poc/details` does not say.
 */
@UI.label("Contact Person")
// `ContactPersonDataTypeV3` permits County and Province, but neither appears on the official
// read-only PDF or in the existing SGG form. Keep the canonical address shape -- and with it
// the XML capacity -- and drop only these two from what an applicant is shown. Declared on the
// contact rather than four times on the form: it is a fact about this contact, and the form
// asks for four of them.
@UI.overrides(#{
  `address.county`: #{ omit: true },
  `address.province`: #{ omit: true },
})
@UI.order(
  EPAKeyContactPerson.name,
  EPAKeyContactPerson.title,
  EPAKeyContactPerson.address,
  EPAKeyContactPerson.phone,
  EPAKeyContactPerson.fax,
  EPAKeyContactPerson.email
)
model EPAKeyContactPerson {
  /** Enter the contact's name. First and last name are required. */
  @UI.label("Name")
  @Validation.requiredPaths("firstName", "lastName")
  name: QuestionPersonName;

  /** Enter the contact's position title. */
  @UI.label("Title")
  title?: ContactTitle;

  /** Enter the contact's complete address. */
  @UI.label("Complete Address")
  @Validation.requiredPaths("street1", "city", "country")
  @Validation.requiredPathWhen("state", "country", CountryCode.USA)
  @Validation.requiredPathWhen("zipCode", "country", CountryCode.USA)
  address: QuestionAddress;

  /** Enter the contact's telephone number. */
  @UI.label("Phone Number")
  phone: PhoneNumber;

  /** Enter the contact's fax number. */
  @UI.label("Fax Number")
  fax?: PhoneNumber;

  /** Enter the contact's e-mail address. */
  @UI.label("E-mail Address")
  email?: EmailAddress;
}

/** EPA KEY CONTACTS FORM, Grants.gov version 2.0. */
@Sgg.sync
@Meta.form(#{
  id: "epa-key-contacts",
  legacyFormId: 674,
  formName: "EPA KEY CONTACTS FORM",
  shortFormName: "EPA_KeyContacts",
  formVersion: "2.0",
  agencyCode: "SGG",
  ombNumber: "2030-0020",
})
@UI.sections(EPAKeyContactsSection)
model EPAKeyContacts {
  /** Original awards and amendments will be sent to this individual for review and acceptance, unless otherwise indicated. */
  @UI.label("Authorized Representative")
  @UI.helpText("Original awards and amendments will be sent to this individual for review and acceptance, unless otherwise indicated.")
  @UI.section(EPAKeyContactsSection.authorizedRepresentative)
  authorizedRepresentative?: EPAKeyContactPerson;

  /** Individual authorized to accept payments. */
  @UI.label("Payee")
  @UI.helpText("Individual authorized to accept payments.")
  @UI.section(EPAKeyContactsSection.payee)
  payee?: EPAKeyContactPerson;

  /** Individual from the Sponsored Programs Office to contact concerning administrative matters. */
  @UI.label("Administrative Contact")
  @UI.helpText("Individual from Sponsored Programs Office to contact concerning administrative matters (i.e., indirect cost rate computation, rebudgeting requests etc).")
  @UI.section(EPAKeyContactsSection.administrativeContact)
  administrativeContact?: EPAKeyContactPerson;

  /** Individual responsible for the technical completion of the proposed work. */
  @UI.label("Project Manager")
  @UI.helpText("Individual responsible for the technical completion of the proposed work.")
  @UI.section(EPAKeyContactsSection.projectManager)
  projectManager?: EPAKeyContactPerson;
}
