import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.PrimaryOrg;

/** Enter the address of the applicant. */
@Meta.question(#{ id: "primary-org/address", entity: EntityName.primaryOrg })
@Meta.tag(TagName.address)
@UI.label("Address")
@Validation.requiredPaths("street1", "city", "country")
@Validation.requiredPathWhen("state", "country", CountryCode.USA)
@Validation.requiredPathWhen("zipCode", "country", CountryCode.USA)
model QuestionPrimaryOrgAddress extends QuestionAddress {}
