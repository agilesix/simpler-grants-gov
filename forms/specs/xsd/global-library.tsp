import "@typespec/xml";
import "../questions/types/address.tsp";
import "../questions/person/index.tsp";
import "../mapping/targets.tsp";
import "simpler-forms";

using TypeSpec.Xml;
using SimplerForms;

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
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.PersonName.prefix)
  @name("PrefixName") prefixName?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.PersonName.firstName)
  @name("FirstName") firstName: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.PersonName.middleName)
  @name("MiddleName") middleName?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.PersonName.lastName)
  @name("LastName") lastName: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.PersonName.suffix)
  @name("SuffixName") suffixName?: string;
}

/** `globLib:AddressDataTypeV3`. State and Province are an `xs:choice`. */
@ns(Namespaces.globLib)
model AddressDataTypeV3 {
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.street1)
  @name("Street1") street1: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.street2)
  @name("Street2") street2?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.city)
  @name("City") city: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.county)
  @name("County") county?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.state)
  @name("State") state?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.province)
  @name("Province") province?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.zipCode)
  @name("ZipPostalCode") zipPostalCode?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.Types.Address.country)
  @name("Country") country: string;
}

/** `globLib:ContactPersonDataTypeV3` */
@ns(Namespaces.globLib)
model ContactPersonDataTypeV3 {
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.Person.name)
  @name("Name") name: HumanNameDataType;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.Person.title)
  @name("Title") title?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.Person.address)
  @name("Address") address: AddressDataTypeV3;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.Person.phone)
  @name("Phone") phone?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.Person.fax)
  @name("Fax") fax?: string;
  @Mapping.from(Mappings.Target.grantsGovXml, Questions.People.Person.email)
  @name("Email") email?: string;
}
