import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.RRKeyPersonExpanded;

// The paper form's sections: the PD/PI, the other senior/key persons, then the attachments
// for anyone the form has no room for.
@Meta.form(#{ id: "rr-key-person-expanded", formName: "RESEARCH & RELATED Senior/Key Person Profile (Expanded)" })
@UI.layout(RRKeyPersonExpanded)
model RRKeyPersonExpandedLayout {
  @UI.label("PD/PI Profile")
  @UI.field(RRKeyPersonExpanded.principalInvestigator)
  principalInvestigator: {
    @UI.flatten profile: RRExpandedKeyPersonEntry.profile;
  };

  @UI.label("Senior/Key Person Profiles")
  @UI.field(RRKeyPersonExpanded.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.flatten profile: RRExpandedKeyPersonEntry.profile;
  };

  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: RRKeyPersonExpanded.additionalProfiles;
    additionalBiographicalSketches: RRKeyPersonExpanded.additionalBiographicalSketches;
    additionalCurrentPendingSupport: RRKeyPersonExpanded.additionalCurrentPendingSupport;
  };
}
