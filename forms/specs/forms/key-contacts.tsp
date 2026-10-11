import "simpler-forms";
import "./index.tsp";
import "../questions/organization/index.tsp";
import "../questions/person/key-contact.tsp";
import "../mapping/targets.tsp";
import "../xsd/key-contacts-2-0.tsp";

using SimplerForms;

namespace Forms.KeyContacts;

/** Sections, in paper-form order. */
enum KeyContactsSection {
  keyContacts: "Key Contacts",
}

/** KEY CONTACTS (Grants.gov FID 683, v2.0) */
@Meta.form(#{
  id: "key-contacts",
  legacyFormId: 683,
  formName: "KEY CONTACTS",
  shortFormName: "Key_Contacts",
  formVersion: "2.0",
  agencyCode: "SGG",
  ombNumber: "4040-0010",
})
@UI.sections(KeyContactsSection)
@Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.Root)
@example(#{
  applicantOrganizationName: "Acme Corporation",
  keyContacts: #[
    Questions.People.Examples.principalInvestigator,
    Questions.People.Examples.projectManager
  ],
})
model KeyContacts {
  /** Enter the legal name of the applicant that will undertake the assistance activity. This field is required. */
  @UI.label("Applicant Organization Name")
  @UI.section(KeyContactsSection.keyContacts)
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.Root.applicantOrganizationName)
  applicantOrganizationName: Questions.Organizations.OrganizationName;

  /** You may enter up to four (4) Key Contacts. At least 1 (one) contact person is required. Additional contacts are optional. */
  @UI.label("Key Contacts")
  @UI.section(KeyContactsSection.keyContacts)
  @minItems(1)
  @maxItems(4)
  @UI.widget(Rendering.Widget.CollapsibleFieldList)
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.Root.roleOnProject)
  keyContacts: Questions.People.KeyContact[];
}
