import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";
import "#mapping/targets.tsp";
import "./form.tsp";
using TypeSpec.Xml;
using SimplerForms;
namespace XSD.USDAAD3030;
alias grantsGovXml = Mappings.Target.grantsGovXml;
alias Form = Forms.USDAAD3030.Representations;
alias Applicant = Forms.USDAAD3030.Applicant;
alias Certification = Forms.USDAAD3030.Certification;
@nsDeclarations
enum Namespaces {
  AD_3030_2_0: "http://apply.grants.gov/forms/AD_3030_2_0-V2.0",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
  codes: "http://apply.grants.gov/system/UniversalCodes-V2.0",
}
@name("AD_3030_2_0")
@ns(Namespaces.AD_3030_2_0)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/AD_3030_2_0-V2.0.xsd")
@Mapping.from(grantsGovXml, Form)
model Root {
  @Mapping.from(grantsGovXml, Applicant.name)
  @name("ApplicantName")
  applicantName: string;

  @Mapping.from(grantsGovXml, Applicant.address)
  @name("ApplicantAddress")
  applicantAddress: string;

  @Mapping.from(grantsGovXml, Applicant.taxIdNumber)
  @name("TaxIDNumber")
  taxIdNumber: string;

  @Mapping.from(grantsGovXml, Applicant.felonyConviction)
  @name("ApplicantFelony")
  applicantFelony: Forms.USDAAD3030.YesNo;

  @Mapping.from(grantsGovXml, Applicant.unpaidFederalTax)
  @name("UnpaidFederalTax")
  unpaidFederalTax: Forms.USDAAD3030.YesNo;

  @Mapping.from(grantsGovXml, Certification.signature)
  @name("AORSignature")
  aorSignature: string;

  @Mapping.from(grantsGovXml, Certification.title) @name("Title") title: string;

  @Mapping.from(grantsGovXml, Certification.dateSigned)
  @name("DateSigned")
  dateSigned: plainDate;

  @attribute @name("FormVersion") formVersion: "2.0";
}
