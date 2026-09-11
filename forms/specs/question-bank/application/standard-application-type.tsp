import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Describe the SF-424 application lifecycle and any revision. */
@Meta.question(#{
  id: "application/standard-application-type",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.details)
model QuestionSf424ApplicationType {
  /** Select one type of application in accordance with agency instructions. */
  @UI.label("Application Type")
  applicationType: Sf424ApplicationType;

  /** Select a revision type from the list provided. A selection is required if Type of Application is Revision. */
  @UI.label("Revision Type")
  @Validation.requiredWhen(
    QuestionSf424ApplicationType.applicationType,
    Sf424ApplicationType.revision
  )
  revisionType?: Sf424RevisionType;

  /** Please specify the type of revision. This field is required if E. Other is checked. */
  @UI.label("Other Explanation")
  @Validation.requiredWhen(
    QuestionSf424ApplicationType.revisionType,
    Sf424RevisionType.E
  )
  @minLength(1)
  @maxLength(21)
  revisionOtherSpecify?: string;
}
