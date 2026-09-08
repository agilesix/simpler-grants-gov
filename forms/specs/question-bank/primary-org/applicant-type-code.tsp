import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Select the applicant's single primary category. */
@Meta.question(#{ id: "primary-org/applicant-type-code", entity: EntityName.primaryOrg })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.organization, TagName.role)
model QuestionApplicantTypeCode {
  @UI.label("Type of Applicant")
  applicantTypeCode: ApplicantTypeCode;
}
