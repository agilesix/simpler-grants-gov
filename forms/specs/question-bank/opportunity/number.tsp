import "simpler-forms";
import "../index.tsp";

using SimplerForms;

/**
 * Everything a form asks about the opportunity being applied to. Every one of these is
 * known before the applicant starts, which is why they all carry a pre-population rule
 * wherever a form composes them.
 */
namespace QuestionBank.Opportunity;

/** The funding opportunity number. */
@Meta.question(#{ id: "opportunity/number", entity: EntityName.opportunity })
@Meta.tag(TagName.identifier)
@UI.label("Opportunity Number")
@minLength(1)
@maxLength(40)
scalar OpportunityNumber extends string;
