import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";

import "#mapping/targets.tsp";
import "#xsd/global-library.tsp";

import "./form.tsp";

using TypeSpec.Xml;
using SimplerForms;

/** CD511-V1.1.xsd */
namespace XSD.CD51111;

alias grantsGovXml = Mappings.Target.grantsGovXml;
alias CD511 = Forms.CD511.CD511;
alias GlobLib = XSD.GlobLib;

@nsDeclarations
enum Namespaces {
  CD511: "http://apply.grants.gov/forms/CD511-V1.1",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
}

@name("CD511")
@ns(Namespaces.CD511)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/CD511-V1.1.xsd")
@Mapping.from(grantsGovXml, CD511)
model Root {
  @Mapping.from(grantsGovXml, CD511.applicantName)
  @name("OrganizationName")
  organizationName: string;

  @Mapping.from(grantsGovXml, CD511.awardNumber)
  @name("AwardNumber")
  awardNumber?: string;

  @Mapping.from(grantsGovXml, CD511.projectName)
  @name("ProjectName")
  projectName?: string;

  @Mapping.from(grantsGovXml, CD511.contactPerson)
  @name("ContactName")
  contactName?: GlobLib.HumanNameDataType;

  @Mapping.from(grantsGovXml, CD511.contactPersonTitle)
  @name("Title")
  title: string;

  @Mapping.from(grantsGovXml, CD511.signature)
  @name("Signature")
  signature: string;

  @Mapping.from(grantsGovXml, CD511.submittedDate)
  @name("SubmittedDate")
  submittedDate: plainDate;

  @attribute @name("FormVersion") formVersion: "1.1";
}
