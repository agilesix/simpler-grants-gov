import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Enter the applicant organization's website, if applicable. */
@Meta.question(#{ id: "primary-org/website", entity: EntityName.primaryOrg })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.organization, TagName.details)
@UI.label("Web Address")
@format("uri-reference")
@minLength(1)
scalar PrimaryOrgWebsite extends string;
