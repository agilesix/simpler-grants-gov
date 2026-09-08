import "simpler-forms";
import "../index.tsp";

using SimplerForms;


/**
 * Everything a form asks about the opportunity being applied to. Every one of these is
 * known before the applicant starts, which is why they all carry a pre-population rule
 * wherever a form composes them.
 */
namespace QuestionBank.Opportunity;

/** The competition title within the opportunity. */
@Meta.question(#{ id: "opportunity/competition-title",
  entity: EntityName.opportunity,
})
@Meta.tag(TagName.title)
@UI.label("Competition Title")
@minLength(1)
@maxLength(255)
scalar CompetitionTitle extends string;
