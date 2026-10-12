import "@typespec/xml";
import "../forms/epa-key-contacts/form.tsp";
import "../mapping/targets.tsp";
import "simpler-forms";
import "form-library-xml";
import "./global-library.tsp";

using TypeSpec.Xml;
using SimplerForms;

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
@Mapping.from(Mappings.Target.grantsGovXml, Forms.EPAKeyContacts.EPAKeyContacts)
model Root {
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.EPAKeyContacts.EPAKeyContacts.authorizedRepresentative)
  @name("AuthorizedRepresentative") authorizedRepresentative?: XSD.GlobLib.ContactPersonDataTypeV3;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.EPAKeyContacts.EPAKeyContacts.payee)
  @name("Payee") payee?: XSD.GlobLib.ContactPersonDataTypeV3;
  // The XSD spells it this way.
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.EPAKeyContacts.EPAKeyContacts.administrativeContact)
  @name("AdminstrativeContact") administrativeContact?: XSD.GlobLib.ContactPersonDataTypeV3;
  @Mapping.from(Mappings.Target.grantsGovXml, Forms.EPAKeyContacts.EPAKeyContacts.projectManager)
  @name("ProjectManager") projectManager?: XSD.GlobLib.ContactPersonDataTypeV3;
  @attribute @name("FormVersion") formVersion: "2.0";
}
