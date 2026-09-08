import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Provide additional project titles when the application needs more than one. */
@Meta.question(#{ id: "project/additional-titles", entity: EntityName.project })
@Meta.tag(TagName.title, TagName.attachment)
scalar AdditionalProjectTitle extends AttachmentRef;
