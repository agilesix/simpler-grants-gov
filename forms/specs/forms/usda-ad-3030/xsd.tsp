import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";

import "#mapping/targets.tsp";
import "#mapping/transforms.tsp";

import "./form.tsp";

using TypeSpec.Xml;
using SimplerForms;

/** AD_3030_2_0-V2.0.xsd */
namespace XSD.AD30302;

alias grantsGovXml = Mappings.Target.grantsGovXml;
alias Transformation = Mappings.Transforms.Transformation;
alias AD3030 = Forms.AD3030.AD3030;

@nsDeclarations
enum Namespaces {
  AD_3030_2_0: "http://apply.grants.gov/forms/AD_3030_2_0-V2.0",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
  codes: "http://apply.grants.gov/system/UniversalCodes-V2.0",
}

@name("AD_3030_2_0")
@ns(Namespaces.AD_3030_2_0)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/AD_3030_2_0-V2.0.xsd")
@Mapping.from(grantsGovXml, AD3030)
model Root {
  @Mapping.from(grantsGovXml, AD3030.applicantName)
  @name("ApplicantName")
  applicantName: string;

  @Mapping.from(grantsGovXml, AD3030.applicantAddress)
  @name("ApplicantAddress")
  applicantAddress: string;

  @Mapping.from(grantsGovXml, AD3030.taxIdNumber)
  @name("TaxIDNumber")
  taxIdNumber: string;

  @Mapping.from(grantsGovXml, AD3030.applicantFelony)
  @Mapping.transform(Transformation.booleanToYesNo)
  @name("ApplicantFelony")
  applicantFelony: string;

  @Mapping.from(grantsGovXml, AD3030.unpaidFederalTax)
  @Mapping.transform(Transformation.booleanToYesNo)
  @name("UnpaidFederalTax")
  unpaidFederalTax: string;

  @Mapping.from(grantsGovXml, AD3030.signature)
  @name("AORSignature")
  aorSignature: string;

  @Mapping.from(grantsGovXml, AD3030.title)
  @name("Title")
  title: string;

  @Mapping.from(grantsGovXml, AD3030.dateSigned)
  @name("DateSigned")
  dateSigned: plainDate;

  @attribute @name("FormVersion") formVersion: "2.0";
}
