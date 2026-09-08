import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

// The answer is a list, so the question is the list: one to three codes, which is what both
// forms asking it require. Each form supplies its own wording for *how* to choose.
/** The applicant's category or categories. */
@Meta.question(#{ id: "primary-org/applicant-type", entity: EntityName.primaryOrg })
@Meta.tag(TagName.organization, TagName.role)
@UI.label("Type of Applicant")
@minItems(1)
@maxItems(3)
model ApplicantTypes is ApplicantTypeCode[];
