import "simpler-forms";

import "#mapping/targets.tsp";
import "#questions/index.tsp";
import "#xsd/global-library.tsp";

using SimplerForms;

// Maps to globLib:HumanNameDataType (PrefixName, FirstName, MiddleName, LastName, SuffixName).
namespace Questions.People;

/** The parts of a person's name, one scalar per field. */
namespace NameParts {
  /** Enter the Prefix. */
  @Meta.question(#{ id: "person/name/prefix" })
  @minLength(1)
  @maxLength(10)
  scalar Prefix extends string;

  /** Enter the First Name. */
  @Meta.question(#{ id: "person/name/first-name" })
  @minLength(1)
  @maxLength(35)
  scalar FirstName extends string;

  /** Enter the Middle Name. */
  @Meta.question(#{ id: "person/name/middle-name" })
  @minLength(1)
  @maxLength(25)
  scalar MiddleName extends string;

  /** Enter the Last Name. */
  @Meta.question(#{ id: "person/name/last-name" })
  @minLength(1)
  @maxLength(60)
  scalar LastName extends string;

  /** Enter the Suffix. */
  @Meta.question(#{ id: "person/name/suffix" })
  @minLength(1)
  @maxLength(10)
  scalar Suffix extends string;
}

/** A person's name, in five parts. `HumanNameDataType` requires the first and last name. */
@Meta.question(#{ id: "person/name" })
@Meta.tag(TagName.person, TagName.name)
@UI.label("Name")
@Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.HumanNameDataType)
model PersonName {
  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.HumanNameDataType.prefixName)
  @UI.label("Prefix")
  prefix?: Questions.People.NameParts.Prefix;

  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.HumanNameDataType.firstName)
  @UI.label("First Name")
  firstName: Questions.People.NameParts.FirstName;

  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.HumanNameDataType.middleName)
  @UI.label("Middle Name")
  middleName?: Questions.People.NameParts.MiddleName;

  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.HumanNameDataType.lastName)
  @UI.label("Last Name")
  lastName: Questions.People.NameParts.LastName;

  @Mapping.to(Mappings.Target.grantsGovXml, XSD.GlobLib.HumanNameDataType.suffixName)
  @UI.label("Suffix")
  suffix?: Questions.People.NameParts.Suffix;
}
