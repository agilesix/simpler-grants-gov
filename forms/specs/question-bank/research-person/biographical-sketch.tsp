import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/** Attach this person's biographical sketch. */
@Meta.question(#{
  id: "research-person/biographical-sketch",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.attachment)
@UI.label("Attach Biographical Sketch")
scalar ResearchPersonBiographicalSketch extends AttachmentRef;
