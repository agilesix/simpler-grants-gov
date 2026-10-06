import "simpler-forms";
import "./index.tsp";
import "../questions/person/index.tsp";

using SimplerForms;

namespace Forms.EPAKeyContacts;

/** Fixed EPA contact roles, in official paper-form order. */
enum EPAKeyContactsSection {
  authorizedRepresentative: "Authorized Representative",
  payee: "Payee",
  administrativeContact: "Administrative Contact",
  projectManager: "Project Manager",
}

// Each role is a `globLib:ContactPersonDataTypeV3`, i.e. a `Person`. The role is given by
// where the person sits in the form, so there is no EPA-specific person question.
//
// `ContactPersonDataTypeV3` permits County and Province, but neither appears on the official
// read-only PDF or in the existing SGG form, so they are omitted from what an applicant is shown.
// TODO: simpler-forms 0.1.0-alpha.1 does not apply `omit` overrides yet, so these omits take
// effect once https://github.com/agilesix/simpler-forms/issues/6 is released.
/** EPA KEY CONTACTS FORM, Grants.gov version 2.0. */
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
@example(#{
  authorizedRepresentative: Questions.People.Examples.usContact,
  payee: Questions.People.Examples.usContactNoEmail,
  administrativeContact: Questions.People.Examples.usContact,
  projectManager: Questions.People.Examples.internationalContact,
})
@UI.overrides(#{
  `authorizedRepresentative.address.county`: #{ omit: true },
  `authorizedRepresentative.address.province`: #{ omit: true },
  `payee.address.county`: #{ omit: true },
  `payee.address.province`: #{ omit: true },
  `administrativeContact.address.county`: #{ omit: true },
  `administrativeContact.address.province`: #{ omit: true },
  `projectManager.address.county`: #{ omit: true },
  `projectManager.address.province`: #{ omit: true },
})
model EPAKeyContacts {
  /** Original awards and amendments will be sent to this individual for review and acceptance, unless otherwise indicated. */
  @UI.label("Authorized Representative")
  @UI.section(EPAKeyContactsSection.authorizedRepresentative)
  authorizedRepresentative?: Questions.People.Person;

  /** Individual authorized to accept payments. */
  @UI.label("Payee")
  @UI.section(EPAKeyContactsSection.payee)
  payee?: Questions.People.Person;

  /** Individual from Sponsored Programs Office to contact concerning administrative matters (i.e., indirect cost rate computation, rebudgeting requests etc). */
  @UI.label("Administrative Contact")
  @UI.section(EPAKeyContactsSection.administrativeContact)
  administrativeContact?: Questions.People.Person;

  /** Individual responsible for the technical completion of the proposed work. */
  @UI.label("Project Manager")
  @UI.section(EPAKeyContactsSection.projectManager)
  projectManager?: Questions.People.Person;
}
