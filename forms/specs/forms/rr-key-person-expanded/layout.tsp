import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.RRKeyPersonExpanded;

/** One person's profile, in the groups every key-person form shares. */
model RRExpandedKeyPersonProfileLayout {
  name: RRExpandedKeyPersonProfile.name;

  @UI.label("Role")
  role: {
    title: RRExpandedKeyPersonProfile.title;
    organizationName: RRExpandedKeyPersonProfile.organizationName;
    department: RRExpandedKeyPersonProfile.department;
    division: RRExpandedKeyPersonProfile.division;
    projectRole: RRExpandedKeyPersonProfile.projectRole;
    otherProjectRoleCategory: RRExpandedKeyPersonProfile.otherProjectRoleCategory;
  };

  address: RRExpandedKeyPersonProfile.address;

  @UI.label("Contact Information")
  contact: {
    phone: RRExpandedKeyPersonProfile.phone;
    fax: RRExpandedKeyPersonProfile.fax;
    email: RRExpandedKeyPersonProfile.email;
  };

  @UI.label("Credentials")
  credentials: {
    credential: RRExpandedKeyPersonProfile.credential;
    degreeType: RRExpandedKeyPersonProfile.degreeType;
    degreeYear: RRExpandedKeyPersonProfile.degreeYear;
  };

  @UI.label("Attachments")
  attachments: {
    biographicalSketch: RRExpandedKeyPersonProfile.biographicalSketch;
    currentPendingSupport: RRExpandedKeyPersonProfile.currentPendingSupport;
  };
}

// The paper form's sections: the PD/PI, the other senior/key persons, then the attachments
// for anyone the form has no room for.
@Meta.form(#{
  id: "rr-key-person-expanded",
  formName: "RESEARCH & RELATED Senior/Key Person Profile (Expanded)",
})
@UI.layout(RRKeyPersonExpanded)
model RRKeyPersonExpandedLayout {
  @UI.label("PD/PI Profile")
  @UI.field(RRKeyPersonExpanded.principalInvestigator)
  principalInvestigator: {
    @UI.field(RRExpandedKeyPersonEntry.profile)
    @UI.flatten
    profile: RRExpandedKeyPersonProfileLayout;
  };

  @UI.label("Senior/Key Person Profiles")
  @UI.field(RRKeyPersonExpanded.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.field(RRExpandedKeyPersonEntry.profile)
    @UI.flatten
    profile: RRExpandedKeyPersonProfileLayout;
  };

  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: RRKeyPersonExpanded.additionalProfiles;
    additionalBiographicalSketches: RRKeyPersonExpanded.additionalBiographicalSketches;
    additionalCurrentPendingSupport: RRKeyPersonExpanded.additionalCurrentPendingSupport;
  };
}
