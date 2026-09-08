import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Poc;

/** Enter the contact person's organization when it differs from the applicant organization. */
@Meta.question(#{ id: "poc/organization-affiliation", entity: EntityName.poc })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.organization, TagName.name)
@UI.label("Organizational Affiliation")
scalar PocOrganizationAffiliation extends OrganizationName;
