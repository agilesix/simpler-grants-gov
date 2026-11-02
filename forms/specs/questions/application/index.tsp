import "simpler-forms";
import "#questions/index.tsp";

using SimplerForms;

namespace Questions.Applications;

/** The federal agency providing the funding opportunity. */
@Meta.question(#{ id: "opportunity/agency-name" })
@UI.label("Name of Federal Agency")
@minLength(1)
@maxLength(60)
scalar AgencyName extends string;

/** The assistance listing number associated with this competition. */
@Meta.question(#{ id: "opportunity/assistance-listing-number" })
@UI.label("Assistance Listing Number")
@minLength(1)
@maxLength(15)
scalar AssistanceListingNumber extends string;

/** The program title associated with the assistance listing. */
@Meta.question(#{ id: "opportunity/assistance-listing-title" })
@UI.label("Assistance Listing Title")
@minLength(1)
@maxLength(120)
scalar AssistanceListingTitle extends string;

/** The number identifying the funding opportunity. */
@Meta.question(#{ id: "opportunity/number" })
@UI.label("Funding Opportunity Number")
@minLength(1)
@maxLength(40)
scalar OpportunityNumber extends string;

/** The title of the funding opportunity. */
@Meta.question(#{ id: "opportunity/title" })
@UI.label("Funding Opportunity Title")
@minLength(1)
@maxLength(255)
scalar OpportunityTitle extends string;

/** Enter a brief, descriptive title of the project. */
@Meta.question(#{ id: "project/title" })
@UI.label("Project Title")
@minLength(1)
@maxLength(200)
scalar ProjectTitle extends string;

/** Enter the Congressional District as a two-character state abbreviation, a hyphen and a three-digit district number (for example, CA-005). If outside the US, enter 00-000. */
@Meta.question(#{ id: "application/congressional-district" })
@UI.label("Congressional District of Applicant")
@minLength(1)
@maxLength(6)
scalar ApplicantCongressionalDistrict extends string;
