import "@typespec/xml";
import "form-library-xml";
import "simpler-forms";

import "#mapping/targets.tsp";
import "#mapping/transforms.tsp";

import "./form.tsp";

using TypeSpec.Xml;
using SimplerForms;

/** FRA-V1.0.xsd */
namespace XSD.FRA10;

alias grantsGovXml = Mappings.Target.grantsGovXml;
alias Transformation = Mappings.Transforms.Transformation;
alias FRAF30 = Forms.FRAF30.FRAF30;

@nsDeclarations
enum Namespaces {
  FRA: "http://apply.grants.gov/forms/FRA-V1.0",
  globLib: "http://apply.grants.gov/system/GlobalLibrary-V2.0",
}

@name("FRA")
@ns(Namespaces.FRA)
@GrantsGov.xsd("https://apply07.grants.gov/apply/forms/schemas/FRA-V1.0.xsd")
@Mapping.from(grantsGovXml, FRAF30)
model Root {
  @Mapping.from(grantsGovXml, Mapping.Item<FRAF30.placesOfPerformance, 0>)
  @name("PlaceofPerformance1")
  placeofPerformance1?: string;

  @Mapping.from(grantsGovXml, Mapping.Item<FRAF30.placesOfPerformance, 1>)
  @name("PlaceofPerformance2")
  placeofPerformance2?: string;

  @Mapping.from(grantsGovXml, Mapping.Item<FRAF30.placesOfPerformance, 2>)
  @name("PlaceofPerformance3")
  placeofPerformance3?: string;

  @Mapping.from(grantsGovXml, FRAF30.workplacesNotIdentified)
  @Mapping.transform(Transformation.booleanToYesNo)
  @name("WorkplacesNotIdentified")
  workplacesNotIdentified?: string;

  @Mapping.from(grantsGovXml, FRAF30.exceedsLobbyingThreshold)
  @Mapping.transform(Transformation.booleanToYesNo)
  @name("CheckExceeding")
  checkExceeding?: string;

  @name("AuthorizedRepresentative")
  authorizedRepresentative: AuthorizedRepresentative;

  @Mapping.from(grantsGovXml, FRAF30.dateSigned)
  @name("DateSigned")
  dateSigned: plainDate;

  @attribute @name("FormVersion") formVersion: "1.0";
}

// A wrapper with no field of its own: its elements read from the form's root.
@ns(Namespaces.FRA)
model AuthorizedRepresentative {
  @Mapping.from(grantsGovXml, FRAF30.signature)
  @name("Signature")
  signature: string;

  @Mapping.from(grantsGovXml, FRAF30.nameAndTitle)
  @name("NameandTitle")
  nameandTitle: string;
}
