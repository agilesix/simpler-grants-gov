import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Provide other narrative information requested for the application. */
@Meta.question(#{ id: "application/other-narrative", entity: EntityName.application })
@Meta.tag(TagName.narrative, TagName.attachment)
@UI.label("Other Narrative")
scalar OtherNarrative extends AttachmentRef;
