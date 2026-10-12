import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.RRKeyPerson;

/** One person's profile, in the groups every key-person form shares. */
model RRKeyPersonProfileLayout {
  name: RRKeyPersonProfile.name;

  @UI.label("Role")
  role: {
    title: RRKeyPersonProfile.title;
    organizationName: RRKeyPersonProfile.organizationName;
    department: RRKeyPersonProfile.department;
    division: RRKeyPersonProfile.division;
    projectRole: RRKeyPersonProfile.projectRole;
    otherProjectRoleCategory: RRKeyPersonProfile.otherProjectRoleCategory;
  };

  address: RRKeyPersonProfile.address;

  @UI.label("Contact Information")
  contact: {
    phone: RRKeyPersonProfile.phone;
    fax: RRKeyPersonProfile.fax;
    email: RRKeyPersonProfile.email;
  };

  @UI.label("Credentials")
  credentials: {
    credential: RRKeyPersonProfile.credential;
  };

  @UI.label("Attachments")
  attachments: {
    biographicalSketch: RRKeyPersonProfile.biographicalSketch;
    currentPendingSupport: RRKeyPersonProfile.currentPendingSupport;
  };
}

// The paper form's sections: the PD/PI, the other senior/key persons, then the attachments
// for anyone the form has no room for.
@Meta.form(#{
  id: "rr-key-person",
  formName: "RESEARCH & RELATED Senior/Key Person Profile",
})
@UI.layout(RRKeyPerson)
model RRKeyPersonLayout {
  @UI.label("PD/PI Profile")
  @UI.field(RRKeyPerson.principalInvestigator)
  principalInvestigator: {
    @UI.field(RRKeyPersonEntry.profile)
    @UI.flatten
    profile: RRKeyPersonProfileLayout;
  };

  @UI.label("Senior/Key Person Profiles")
  @UI.field(RRKeyPerson.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.field(RRKeyPersonEntry.profile)
    @UI.flatten
    profile: RRKeyPersonProfileLayout;
  };

  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: RRKeyPerson.additionalProfiles;
    additionalBiographicalSketches: RRKeyPerson.additionalBiographicalSketches;
    additionalCurrentPendingSupport: RRKeyPerson.additionalCurrentPendingSupport;
  };
}
