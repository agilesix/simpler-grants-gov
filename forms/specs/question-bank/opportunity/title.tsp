import "simpler-forms";
import "../index.tsp";

using SimplerForms;


/**
 * Everything a form asks about the opportunity being applied to. Every one of these is
 * known before the applicant starts, which is why they all carry a pre-population rule
 * wherever a form composes them.
 */
namespace QuestionBank.Opportunity;

/** The funding opportunity title. */
@Meta.question(#{ id: "opportunity/title",
  entity: EntityName.opportunity,
})
@Meta.tag(TagName.title)
@UI.label("Opportunity title")
@minLength(1)
@maxLength(255)
scalar OpportunityTitle extends string;
