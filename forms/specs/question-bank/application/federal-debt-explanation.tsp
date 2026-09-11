import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Explain any delinquent federal debt reported by the applicant. */
@Meta.question(#{
  id: "application/federal-debt-explanation",
  entity: EntityName.application,
})
@Meta.tag(TagName.attachment)
scalar FederalDebtExplanation extends AttachmentRef;
