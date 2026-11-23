import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";

import "#mapping/targets.tsp";
import "#xsd/global-library.tsp";

import "./form.tsp";

using TypeSpec.Xml;
using SimplerForms;

/** GG_LobbyingForm-V1.1.xsd */
namespace XSD.GGLobbyingForm11;

alias grantsGovXml = Mappings.Target.grantsGovXml;
alias GrantsGovLobbying = Forms.GrantsGovLobbying.GrantsGovLobbying;
alias GlobLib = XSD.GlobLib;

@nsDeclarations
enum Namespaces {
  GG_LobbyingForm: "http://apply.grants.gov/forms/GG_LobbyingForm-V1.1",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
}

@name("LobbyingForm")
@ns(Namespaces.GG_LobbyingForm)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/GG_LobbyingForm-V1.1.xsd")
@Mapping.from(grantsGovXml, GrantsGovLobbying)
model Root {
  @Mapping.from(grantsGovXml, GrantsGovLobbying.organizationName)
  @name("ApplicantName")
  applicantName: string;

  @Mapping.from(grantsGovXml, GrantsGovLobbying.authorizedRepresentativeName)
  @name("AuthorizedRepresentativeName")
  authorizedRepresentativeName: GlobLib.HumanNameDataType;

  @Mapping.from(grantsGovXml, GrantsGovLobbying.authorizedRepresentativeTitle)
  @name("AuthorizedRepresentativeTitle")
  authorizedRepresentativeTitle: string;

  @Mapping.from(
    grantsGovXml,
    GrantsGovLobbying.authorizedRepresentativeSignature
  )
  @name("AuthorizedRepresentativeSignature")
  authorizedRepresentativeSignature: string;

  @Mapping.from(grantsGovXml, GrantsGovLobbying.submittedDate)
  @name("SubmittedDate")
  submittedDate: plainDate;

  @attribute @name("FormVersion") formVersion: "1.1";
}
