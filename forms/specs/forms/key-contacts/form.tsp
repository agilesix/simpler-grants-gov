import "simpler-forms";
import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "./key-contact.tsp";
import "#mapping/targets.tsp";
import "./xsd.tsp";

using SimplerForms;

namespace Forms.KeyContacts;

/** KEY CONTACTS (Grants.gov FID 683, v2.0) */
@Meta.submission(#{
  id: "key-contacts",
  legacyFormId: 683,
  shortFormName: "Key_Contacts",
  formVersion: "2.0",
  agencyCode: "SGG",
  ombNumber: "4040-0010",
})
@Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.Root)
@example(#{
  applicantOrganizationName: "Acme Corporation",
  keyContacts: #[
    Forms.KeyContacts.Examples.principalInvestigator,
    Forms.KeyContacts.Examples.projectManager
  ],
})
model KeyContacts {
  /** Enter the legal name of the applicant that will undertake the assistance activity. This field is required. */
  @UI.label("Applicant Organization Name")
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.Root.applicantOrganizationName)
  applicantOrganizationName: Questions.Organizations.OrgName;

  /** You may enter up to four (4) Key Contacts. At least 1 (one) contact person is required. Additional contacts are optional. */
  @UI.label("Key Contacts")
  @minItems(1)
  @maxItems(4)
  @UI.widget(Rendering.Widget.CollapsibleFieldList)
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.KeyContacts20.Root.roleOnProject)
  keyContacts: Forms.KeyContacts.KeyContact[];
}
