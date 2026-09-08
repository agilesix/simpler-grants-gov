import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Enter the legal name of the applicant that will undertake the assistance activity. */
@Meta.question(#{ id: "primary-org/legal-name", entity: EntityName.primaryOrg })
@Meta.tag(TagName.organization, TagName.name)
@UI.label("Legal Name")
scalar LegalName extends OrganizationName;
