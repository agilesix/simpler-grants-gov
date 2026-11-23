import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";

import "#mapping/targets.tsp";
import "#xsd/global-library.tsp";

import "./form.tsp";

using TypeSpec.Xml;
using SimplerForms;

/** AD_1047-V1.0.xsd */
namespace XSD.AD1047;

alias grantsGovXml = Mappings.Target.grantsGovXml;
alias AD1047 = Forms.AD1047.AD1047;
alias GlobLib = XSD.GlobLib;

@nsDeclarations
enum Namespaces {
  AD_1047: "http://apply.grants.gov/forms/AD_1047-V1.0",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
  codes: "http://apply.grants.gov/system/UniversalCodes-V2.0",
}

@name("AD_1047")
@ns(Namespaces.AD_1047)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/AD_1047-V1.0.xsd")
@Mapping.from(grantsGovXml, AD1047)
model Root {
  @Mapping.from(grantsGovXml, AD1047.organizationName)
  @name("OrganizationName")
  organizationName: string;

  @Mapping.from(grantsGovXml, AD1047.projectName)
  @name("ProjectName")
  projectName: string;

  @Mapping.from(grantsGovXml, AD1047.authorizedRepresentative)
  @name("AuthorizedRepresentative")
  authorizedRepresentative: GlobLib.HumanNameDataType;

  @Mapping.from(grantsGovXml, AD1047.title)
  @name("Title")
  title: string;

  @Mapping.from(grantsGovXml, AD1047.signature)
  @name("AORSignature")
  aorSignature: string;

  @Mapping.from(grantsGovXml, AD1047.dateSigned)
  @name("DateSigned")
  dateSigned: plainDate;

  @attribute @name("FormVersion") formVersion: "1.0";
}
