// A minimal attestation form: a long legal statement, a yes/no answer, and a signature and
// date Grants.gov fills in on submission. `attestation.test.ts` compiles it, and checks the
// XML mapping and the XML it writes against the snapshots beside it.
import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";

using TypeSpec.Xml;
using SimplerForms;

@Mapping.targets(Target)
namespace Mappings {
  enum Target {
    grantsGovXml,
  }
}

@Mapping.transforms(Transformation)
namespace Mappings.Transforms {
  enum Transformation {
    booleanToYesNo: "boolean_to_yes_no",
  }
}

namespace Forms.Attestation {
  @Meta.form(#{ id: "attestation", formName: "Attestation" })
  model Attestation {
    /** Enter the legal name of the organization. */
    @minLength(1)
    @maxLength(60)
    organizationName: string;

    /** Select Yes or No. */
    @UI.label("Has the applicant been convicted of a felony in the past 24 months?")
    convictedOfFelony: boolean;

    /** Completed by Grants.gov upon submission. */
    @UI.readOnly
    signature?: string;

    /** Completed by Grants.gov upon submission. */
    @UI.readOnly
    submittedDate?: plainDate;
  }

  // The statement is the section's description, in markdown. It's a UI concern only, so the
  // XML mapping doesn't change with it.
  @UI.layout(Attestation)
  model AttestationLayout {
    /**
     * The undersigned certifies, to the best of his or her knowledge and belief, that:
     *
     * 1. No Federal funds have been paid to influence an officer or employee of an agency.
     * 2. The applicant will disclose any other payments on Standard Form-LLL.
     */
    @UI.label("Certification")
    certification: {
      organizationName: Attestation.organizationName;
      convictedOfFelony: Attestation.convictedOfFelony;
    };

    @UI.label("Signature")
    signature: {
      signature: Attestation.signature;
      submittedDate: Attestation.submittedDate;
    };
  }
}

namespace XSD.Attestation {
  alias grantsGovXml = Mappings.Target.grantsGovXml;
  alias Attestation = Forms.Attestation.Attestation;

  @nsDeclarations
  enum Namespaces {
    Attestation: "http://apply.grants.gov/forms/Attestation-V1.0",
  }

  @name("Attestation")
  @ns(Namespaces.Attestation)
  @Mapping.from(grantsGovXml, Attestation)
  model Root {
    @Mapping.from(grantsGovXml, Attestation.organizationName)
    @name("OrganizationName")
    organizationName: string;

    @Mapping.from(grantsGovXml, Attestation.convictedOfFelony)
    @Mapping.transform(Mappings.Transforms.Transformation.booleanToYesNo)
    @name("ConvictedOfFelony")
    convictedOfFelony: string;

    @Mapping.from(grantsGovXml, Attestation.signature)
    @name("Signature")
    signature: string;

    @Mapping.from(grantsGovXml, Attestation.submittedDate)
    @name("SubmittedDate")
    submittedDate: plainDate;

    @attribute @name("FormVersion") formVersion: "1.0";
  }
}
