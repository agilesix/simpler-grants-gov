import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.RRKeyPerson;

// The paper form's sections: the PD/PI, the other senior/key persons, then the attachments
// for anyone the form has no room for.
@Meta.form(#{ id: "rr-key-person", formName: "RESEARCH & RELATED Senior/Key Person Profile" })
@UI.layout(RRKeyPerson)
model RRKeyPersonLayout {
  @UI.label("PD/PI Profile")
  @UI.field(RRKeyPerson.principalInvestigator)
  principalInvestigator: {
    @UI.flatten profile: RRKeyPersonEntry.profile;
  };

  @UI.label("Senior/Key Person Profiles")
  @UI.field(RRKeyPerson.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.flatten profile: RRKeyPersonEntry.profile;
  };

  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: RRKeyPerson.additionalProfiles;
    additionalBiographicalSketches: RRKeyPerson.additionalBiographicalSketches;
    additionalCurrentPendingSupport: RRKeyPerson.additionalCurrentPendingSupport;
  };
}
