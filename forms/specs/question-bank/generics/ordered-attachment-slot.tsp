import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";
import "./attachment.tsp";

using SimplerForms;

namespace QuestionBank.Generics;

/** One optional position in a source-defined ordered attachment sequence. */
@Meta.question(#{
  id: "generics/ordered-attachment-slot",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.generic,
})
@Meta.tag(TagName.attachment)
scalar OrderedAttachmentSlot extends AttachmentRef;
