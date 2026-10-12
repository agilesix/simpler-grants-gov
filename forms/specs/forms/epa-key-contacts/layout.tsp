import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.EPAKeyContacts;

/**
 * One EPA contact: their title under a Role heading after the name, and no County or
 * Province, which `globLib:ContactPersonDataTypeV3` permits but neither the official PDF
 * nor the existing SGG form asks. Relative to `Person`, so one model serves every role.
 */
model EPAContact {
  name: Questions.People.Person.name;

  /** Enter the contact's role. */
  @UI.label("Role")
  role: {
    title: Questions.People.Person.title;
  };

  address: Questions.People.Person.address;

  /** Enter the contact's phone, fax and email. Phone is required. */
  @UI.label("Contact Information")
  contact: {
    phone: Questions.People.Person.phone;
    fax: Questions.People.Person.fax;
    email: Questions.People.Person.email;
  };

  @UI.omit county: Questions.People.Person.address::type.county;
  @UI.omit province: Questions.People.Person.address::type.province;
}

// The paper form's layout: one section per role, in official order.
@Meta.form(#{ id: "epa-key-contacts", formName: "EPA KEY CONTACTS FORM" })
@UI.layout(EPAKeyContacts)
model EPAKeyContactsLayout {
  @UI.label("Authorized Representative")
  @UI.field(EPAKeyContacts.authorizedRepresentative)
  authorizedRepresentative: EPAContact;

  @UI.label("Payee")
  @UI.field(EPAKeyContacts.payee)
  payee: EPAContact;

  @UI.label("Administrative Contact")
  @UI.field(EPAKeyContacts.administrativeContact)
  administrativeContact: EPAContact;

  @UI.label("Project Manager")
  @UI.field(EPAKeyContacts.projectManager)
  projectManager: EPAContact;
}
