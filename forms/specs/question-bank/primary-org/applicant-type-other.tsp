import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Enter the applicant type here if you selected "Other (specify)" for Type of applicant. */
@Meta.question(#{
  id: "primary-org/applicant-type-other",
  entity: EntityName.primaryOrg,
})
@Meta.tag(TagName.organization, TagName.role)
@UI.label("Type of Applicant Other Explanation")
@minLength(0)
@maxLength(30)
scalar ApplicantTypeOther extends string;
