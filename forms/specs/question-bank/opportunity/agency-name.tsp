import "simpler-forms";
import "../index.tsp";

using SimplerForms;


/**
 * Everything a form asks about the opportunity being applied to. Every one of these is
 * known before the applicant starts, which is why they all carry a pre-population rule
 * wherever a form composes them.
 */
namespace QuestionBank.Opportunity;

/** The awarding federal agency. */
@Meta.question(#{ id: "opportunity/agency-name",
  entity: EntityName.opportunity,
})
@Meta.tag(TagName.name, TagName.organization)
@UI.label("Agency Name")
@minLength(1)
@maxLength(60)
scalar AgencyName extends string;
