import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.NSFKeyPersonExpanded;

// The paper form's sections: the PD/PI, the other senior/key persons, then the attachments
// for anyone the form has no room for.
@Meta.form(#{ id: "nsf-key-person-expanded", formName: "NSF Senior/Key Person Profile (Expanded)" })
@UI.layout(NSFKeyPersonExpanded)
model NSFKeyPersonExpandedLayout {
  @UI.label("PD/PI Profile")
  @UI.field(NSFKeyPersonExpanded.principalInvestigator)
  principalInvestigator: {
    @UI.flatten profile: NSFPrincipalInvestigator.profile;
  };

  @UI.label("Senior/Key Person Profiles")
  @UI.field(NSFKeyPersonExpanded.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.flatten profile: NSFSeniorKeyPerson.profile;
  };

  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: NSFKeyPersonExpanded.additionalProfiles;
    additionalBiographicalSketches: NSFKeyPersonExpanded.additionalBiographicalSketches;
    additionalCurrentPendingSupport: NSFKeyPersonExpanded.additionalCurrentPendingSupport;
    additionalCollaborators: NSFKeyPersonExpanded.additionalCollaborators;
    additionalSynergisticActivities: NSFKeyPersonExpanded.additionalSynergisticActivities;
  };
}
