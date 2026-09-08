import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Provide additional congressional districts affected by the proposed project. */
@Meta.question(#{ id: "project/additional-congressional-districts", entity: EntityName.project })
@Meta.tag(TagName.identifier, TagName.attachment)
scalar AdditionalCongressionalDistricts extends AttachmentRef;
