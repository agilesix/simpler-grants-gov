import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Provide the project narrative requested by the funding opportunity. */
@Meta.question(#{ id: "project/narrative", entity: EntityName.project })
@Meta.tag(TagName.narrative, TagName.attachment)
@UI.label("Project Narrative")
scalar ProjectNarrative extends AttachmentRef;
