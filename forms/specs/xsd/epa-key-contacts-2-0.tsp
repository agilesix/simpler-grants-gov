import "@typespec/xml";
import "form-library-xml";
import "./global-library.tsp";

using TypeSpec.Xml;

/** EPA_KeyContacts_2_0-V2.0.xsd */
namespace XSD.EPAKeyContacts20;

@nsDeclarations
enum Namespaces {
  EPA_KeyContacts_2_0: "http://apply.grants.gov/forms/EPA_KeyContacts_2_0-V2.0",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
  codes: "http://apply.grants.gov/system/UniversalCodes-V2.0",
}

@name("KeyContactPersons_2_0")
@ns(Namespaces.EPA_KeyContacts_2_0)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/EPA_KeyContacts_2_0-V2.0.xsd")
model Root {
  @name("AuthorizedRepresentative") authorizedRepresentative?: XSD.GlobLib.ContactPersonDataTypeV3;
  @name("Payee") payee?: XSD.GlobLib.ContactPersonDataTypeV3;
  // The XSD spells it this way.
  @name("AdminstrativeContact") administrativeContact?: XSD.GlobLib.ContactPersonDataTypeV3;
  @name("ProjectManager") projectManager?: XSD.GlobLib.ContactPersonDataTypeV3;
  @attribute @name("FormVersion") formVersion: "2.0";
}
