import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Enter the Federal entity identifier assigned to the applicant organization. */
@Meta.question(#{ id: "application/federal-entity-identifier", entity: EntityName.application })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.identifier)
@minLength(1)
@maxLength(30)
scalar FederalEntityIdentifier extends string;
