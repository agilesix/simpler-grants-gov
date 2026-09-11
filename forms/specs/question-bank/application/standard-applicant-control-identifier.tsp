import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Enter the applicant's control number, if applicable, on the SF-424. */
@Meta.question(#{
  id: "application/standard-applicant-control-identifier",
  entity: EntityName.application,
})
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.identifier)
@minLength(1)
@maxLength(30)
scalar Sf424ApplicantControlIdentifier extends string;
