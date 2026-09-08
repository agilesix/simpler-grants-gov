// The JS that implements the `extern dec` declarations below. Imported here rather than
// only from an entry point so that this file type-checks on its own -- an editor opens
// one file, and an unimplemented `extern dec` is an error.
import "../dist/src/index.js";
import "simpler-forms";

using TypeSpec.Reflection;

namespace SimplerForms.Sgg;

/**
 * Simpler Grants' `gg_pre_population` rule names for external lookups.
 * Each member documents the canonical mapping that will eventually replace it.
 */
enum SggPrePop {
  /** successor: @Map.from(Sources.Opportunity.agencyName) */
  agencyName: "agency_name",

  /** successor: @Map.from(Sources.Opportunity.number) */
  opportunityNumber: "opportunity_number",

  /** successor: @Map.from(Sources.Opportunity.title) */
  opportunityTitle: "opportunity_title",

  /** successor: @Map.from(Sources.Opportunity.assistanceListingNumber) */
  assistanceListingNumber: "assistance_listing_number",

  /** successor: @Map.from(Sources.Opportunity.assistanceListingProgramTitle) */
  assistanceListingProgramTitle: "assistance_listing_program_title",

  /** successor: @Map.from(Sources.Competition.publicId) */
  publicCompetitionId: "public_competition_id",

  /** successor: @Map.from(Sources.Competition.title) */
  competitionTitle: "competition_title",

  /** successor: @Map.from(Sources.OrgProfile.samUei) */
  uei: "uei",
}

/**
 * Which fields the runtime fills in before the applicant sees them, keyed by the path an
 * answer takes: `samUei`, or `assistanceListing.number` for a member of a composed
 * question.
 *
 * A table on the form rather than a decorator per property, for two reasons. A package's
 * members live in the bank, where `@Sgg.*` may not go -- a shared question must not carry
 * one consumer's rules. And everything the runtime pre-fills is then in one place, which
 * is the list a reviewer actually wants to read.
 */
extern dec prePopulate(target: Model, rules: valueof Record<SggPrePop>);

/**
 * Hand an entire section to one of Simpler Grants' bespoke widgets.
 *
 * The budget sections are rendered with purpose-built components rather than from a field
 * list. The component receives the section's properties, which `@UI.section` already
 * says -- so the only thing left to declare is which component, and that is a fact about
 * this renderer rather than about the form. Hence its living here: the canonical UI
 * artifact still describes the section as a group of controls, and a renderer that does
 * not have these six components uses that.
 */
extern dec multiField(target: Model, section: valueof EnumMember, widget: valueof WidgetName);

/** Presentation options for a repeatable field list, specific to this renderer. */
model SggFieldListOptions {
  hideFieldListHeading?: boolean;
  validateBeforeAdd?: boolean;
}

/** Configure how one form-local repeatable property is rendered. */
extern dec fieldList(target: ModelProperty, options: valueof SggFieldListOptions);
