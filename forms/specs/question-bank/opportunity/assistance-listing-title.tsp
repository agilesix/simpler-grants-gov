import "simpler-forms";
import "../index.tsp";

using SimplerForms;

/**
 * Everything a form asks about the opportunity being applied to. Every one of these is
 * known before the applicant starts, which is why they all carry a pre-population rule
 * wherever a form composes them.
 */
namespace QuestionBank.Opportunity;

/** The Assistance Listing program title. */
@Meta.question(#{
  id: "opportunity/assistance-listing-title",
  entity: EntityName.opportunity,
})
@Meta.tag(TagName.title)
@UI.label("Assistance Listing Title")
@minLength(1)
@maxLength(120)
scalar AssistanceListingTitle extends string;
