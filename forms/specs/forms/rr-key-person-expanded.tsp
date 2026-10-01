import "simpler-forms";
import "simpler-forms-sgg";
import "./index.tsp";
import "../question-bank/generics/index.tsp";
import "../question-bank/research-person/index.tsp";

using SimplerForms;
using QuestionBank.Generics;
using QuestionBank.ResearchPerson;

namespace Forms.RRKeyPersonExpanded;

enum RRKeyPersonExpandedSection {
  principalInvestigator: "Project Director / Principal Investigator",
  seniorKeyPersons: "Senior / Key Persons",
  overflowAttachments: "Additional Senior / Key Person Attachments",
}

/**
 * The PD/PI is one senior/key person whose role is fixed and whose biographical sketch is
 * mandatory. Everything else about them is the same question every other key person answers.
 */
model PrincipalInvestigatorProfile extends QuestionResearchPersonProfile {
  /** The role is fixed for this person. */
  @UI.label("Project Role")
  projectRole: ResearchProjectRole = ResearchProjectRole.projectDirectorPrincipalInvestigator;

  /** Attach the PD/PI's biographical sketch. Required for this person. */
  @UI.label("Attach Biographical Sketch")
  @UI.widget(WidgetName.Attachment)
  biographicalSketch: ResearchPersonBiographicalSketch;
}

/** Overflow file for additional senior/key person profiles once structured entry is full. */
@Meta.question(#{
  id: "research-person/additional-profiles-upload",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.attachment)
@UI.label("Additional Senior / Key Person Profiles")
scalar AdditionalResearchPersonProfiles extends AttachmentRef;

/** Overflow file for additional biographical sketches once structured entry is full. */
@Meta.question(#{
  id: "research-person/additional-biographical-sketches-upload",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.attachment)
@UI.label("Additional Biographical Sketches")
scalar AdditionalResearchPersonBiographicalSketches extends AttachmentRef;

/** Overflow file for additional support records once structured entry is full. */
@Meta.question(#{
  id: "research-person/additional-support-upload",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.attachment)
@UI.label("Additional Current and Pending Support")
scalar AdditionalResearchPersonSupport extends AttachmentRef;

/** Research & Related Senior/Key Person Profile (Expanded), Grants.gov version 4.0. */
@Meta.form(#{
  id: "rr-key-person-expanded",
  legacyFormId: 774,
  formName: "Research & Related Senior/Key Person Profile (Expanded)",
  shortFormName: "RR_KeyPersonExpanded_4_0",
  formVersion: "4.0",
  agencyCode: "SGG",
  ombNumber: "4040-0001",
})
@UI.sections(RRKeyPersonExpandedSection)
model RRKeyPersonExpanded {
  /** The project director or principal investigator for this application. */
  @UI.label("Project Director / Principal Investigator")
  @UI.section(RRKeyPersonExpandedSection.principalInvestigator)
  principalInvestigator: PrincipalInvestigatorProfile;

  /** Add every other senior or key person on the project. */
  @UI.label("Senior / Key Person")
  @UI.section(RRKeyPersonExpandedSection.seniorKeyPersons)
  @Sgg.fieldList(#{ validateBeforeAdd: true })
  @maxItems(99)
  seniorKeyPersons?: QuestionResearchPersonProfile[];

  // The three overflow uploads open only once structured entry is full, and stay open while
  // they hold a file, so an upload does not become unreachable if the list is trimmed later.
  /** Attach the profiles that did not fit above. */
  @UI.label("Additional Senior / Key Person Profiles")
  @UI.section(RRKeyPersonExpandedSection.overflowAttachments)
  @UI.widget(WidgetName.Attachment)
  @UI.enabledWhenCountOrPresent(RRKeyPersonExpanded.seniorKeyPersons, 99)
  additionalProfiles?: AdditionalResearchPersonProfiles;

  /** Attach the biographical sketches that did not fit above. */
  @UI.label("Additional Biographical Sketches")
  @UI.section(RRKeyPersonExpandedSection.overflowAttachments)
  @UI.widget(WidgetName.Attachment)
  @UI.enabledWhenCountOrPresent(RRKeyPersonExpanded.seniorKeyPersons, 99)
  additionalBiographicalSketches?: AdditionalResearchPersonBiographicalSketches;

  /** Attach the current and pending support records that did not fit above. */
  @UI.label("Additional Current and Pending Support")
  @UI.section(RRKeyPersonExpandedSection.overflowAttachments)
  @UI.widget(WidgetName.Attachment)
  @UI.enabledWhenCountOrPresent(RRKeyPersonExpanded.seniorKeyPersons, 99)
  additionalCurrentPendingSupport?: AdditionalResearchPersonSupport;
}
