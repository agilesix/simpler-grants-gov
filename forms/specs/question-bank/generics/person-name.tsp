import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;

namespace QuestionBank.Generics;

/** A person's name, in five parts. */
@Meta.question(#{ id: "generics/person-name", entity: EntityName.generic })
@Meta.tag(TagName.person, TagName.name)
@UI.label("Name")
model QuestionPersonName {
  /** Enter the Prefix. */
  @UI.label("Prefix")
  @minLength(1)
  @maxLength(10)
  prefix?: string;

  /** Enter the First Name. */
  @UI.label("First Name")
  @minLength(1)
  @maxLength(35)
  firstName?: string;

  /** Enter the Middle Name. */
  @UI.label("Middle Name")
  @minLength(1)
  @maxLength(25)
  middleName?: string;

  /** Enter the Last Name. */
  @UI.label("Last Name")
  @minLength(1)
  @maxLength(60)
  lastName?: string;

  /** Enter the Suffix. */
  @UI.label("Suffix")
  @minLength(1)
  @maxLength(10)
  suffix?: string;
}
