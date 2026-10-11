import "@typespec/xml";
import "form-library-xml";
import "./global-library.tsp";

using TypeSpec.Xml;

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
model Root {
  @name("ApplicantOrganizationName") applicantOrganizationName: string;
  @name("RoleOnProject") @maxItems(4) roleOnProject: RoleOnProject[];
  @attribute @name("FormVersion") formVersion: "2.0";
}

@ns(Namespaces.Key_Contacts_2_0)
model RoleOnProject {
  @name("ContactProjectRole") contactProjectRole: string;
  @name("ContactName") contactName: XSD.GlobLib.HumanNameDataType;
  @name("ContactTitle") contactTitle?: string;
  @name("ContactOrganizationalAffiliation")
  contactOrganizationalAffiliation?: string;
  @name("ContactAddress") contactAddress: XSD.GlobLib.AddressDataTypeV3;
  @name("ContactPhone") contactPhone: string;
  @name("ContactFax") contactFax?: string;
  @name("ContactEmail") contactEmail: string;
}
