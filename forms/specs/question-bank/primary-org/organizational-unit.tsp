import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Identify the applicant organizational unit undertaking the assistance activity. */
@Meta.question(#{ id: "primary-org/organizational-unit", entity: EntityName.primaryOrg })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.organization, TagName.name)
model QuestionOrganizationalUnit {
  /** Enter the name of primary organizational department, service, laboratory, or equivalent level within the organization which will undertake the assistance activity. */
  @UI.label("Department Name")
  @minLength(1)
  @maxLength(30)
  departmentName?: string;

  /** Enter the name of primary organizational division, office, or major subdivision which will undertake the assistance activity. */
  @UI.label("Division Name")
  @minLength(1)
  @maxLength(100)
  divisionName?: string;
}
