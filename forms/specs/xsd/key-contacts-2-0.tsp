import "@typespec/xml";
import "../forms/key-contacts/form.tsp";
import "../mapping/targets.tsp";
import "simpler-forms";
import "form-library-xml";
import "./global-library.tsp";

using TypeSpec.Xml;
using SimplerForms;

/** Key_Contacts_2_0-V2.0.xsd */
namespace XSD.KeyContacts20;

@nsDeclarations
enum Namespaces {
  Key_Contacts_2_0: "http://apply.grants.gov/forms/Key_Contacts_2_0-V2.0",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
  codes: "http://apply.grants.gov/system/UniversalCodes-V2.0",
}

@name("Key_Contacts_2_0")
@ns(Namespaces.Key_Contacts_2_0)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/Key_Contacts_2_0-V2.0.xsd")
@Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContacts)
model Root {
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContacts.applicantOrganizationName)
  @name("ApplicantOrganizationName") applicantOrganizationName: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContacts.keyContacts)
  @name("RoleOnProject") @maxItems(4) roleOnProject: RoleOnProject[];
  @attribute @name("FormVersion") formVersion: "2.0";
}

@ns(Namespaces.Key_Contacts_2_0)
model RoleOnProject {
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.projectRole)
  @name("ContactProjectRole") contactProjectRole: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.name)
  @name("ContactName") contactName: XSD.GlobLib.HumanNameDataType;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.title)
  @name("ContactTitle") contactTitle?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.organizationalAffiliation)
  @name("ContactOrganizationalAffiliation") contactOrganizationalAffiliation?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.address)
  @name("ContactAddress") contactAddress: XSD.GlobLib.AddressDataTypeV3;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.phone)
  @name("ContactPhone") contactPhone: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.fax)
  @name("ContactFax") contactFax?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.KeyContacts.KeyContact.email)
  @name("ContactEmail") contactEmail: string;
}
