import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/** Attach this person's current and pending support information. */
@Meta.question(#{
  id: "research-person/current-pending-support",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.attachment)
@UI.label("Attach Current & Pending Support")
scalar ResearchPersonCurrentPendingSupport extends AttachmentRef;
