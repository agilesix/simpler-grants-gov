import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.EPAKeyContacts;

/**
 * `globLib:ContactPersonDataTypeV3` permits County and Province, but neither appears on the
 * official read-only PDF or in the existing SGG form. Relative to `Person`, so one model
 * serves every role.
 */
model PersonWithoutCountyOrProvince {
  @UI.omit county: Questions.People.Person.address::type.county;
  @UI.omit province: Questions.People.Person.address::type.province;
}

// The paper form's layout: one section per role, in official order.
@Meta.form(#{ id: "epa-key-contacts", formName: "EPA KEY CONTACTS FORM" })
@UI.layout(EPAKeyContacts)
model EPAKeyContactsLayout {
  @UI.label("Authorized Representative")
  @UI.field(EPAKeyContacts.authorizedRepresentative)
  authorizedRepresentative: PersonWithoutCountyOrProvince;

  @UI.label("Payee")
  @UI.field(EPAKeyContacts.payee)
  payee: PersonWithoutCountyOrProvince;

  @UI.label("Administrative Contact")
  @UI.field(EPAKeyContacts.administrativeContact)
  administrativeContact: PersonWithoutCountyOrProvince;

  @UI.label("Project Manager")
  @UI.field(EPAKeyContacts.projectManager)
  projectManager: PersonWithoutCountyOrProvince;
}
