import "@typespec/xml";

using TypeSpec.Xml;

/** GlobalLibrary-V2.0.xsd: the data types every Grants.gov form shares. */
namespace XSD.GlobLib;

@nsDeclarations
enum Namespaces {
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
  codes: "http://apply.grants.gov/system/UniversalCodes-V2.0",
}

/** `globLib:HumanNameDataType` */
@ns(Namespaces.globLib)
model HumanNameDataType {
  @name("PrefixName") prefixName?: string;
  @name("FirstName") firstName: string;
  @name("MiddleName") middleName?: string;
  @name("LastName") lastName: string;
  @name("SuffixName") suffixName?: string;
}

/** `globLib:AddressDataTypeV3`. State and Province are an `xs:choice`. */
@ns(Namespaces.globLib)
model AddressDataTypeV3 {
  @name("Street1") street1: string;
  @name("Street2") street2?: string;
  @name("City") city: string;
  @name("County") county?: string;
  @name("State") state?: string;
  @name("Province") province?: string;
  @name("ZipPostalCode") zipPostalCode?: string;
  @name("Country") country: string;
}

/** `globLib:ContactPersonDataTypeV3` */
@ns(Namespaces.globLib)
model ContactPersonDataTypeV3 {
  @name("Name") name: HumanNameDataType;
  @name("Title") title?: string;
  @name("Address") address: AddressDataTypeV3;
  @name("Phone") phone?: string;
  @name("Fax") fax?: string;
  @name("Email") email?: string;
}
