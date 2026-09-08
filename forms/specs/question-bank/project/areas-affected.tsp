import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/** Provide the geographic areas affected by the proposed project. */
@Meta.question(#{ id: "project/areas-affected", entity: EntityName.project })
@Meta.tag(TagName.attachment)
scalar ProjectAreasAffected extends AttachmentRef;
