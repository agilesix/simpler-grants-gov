import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.RRKeyPersonExpanded;

/** One person's profile, in the groups every key-person form shares. */
model RRExpandedKeyPersonProfileLayout {
  /** Enter the person's name. First and last name are required. */
  name: RRExpandedKeyPersonProfile.name;

  /** Enter the person's position, organization and role on the project. */
  @UI.label("Role")
  role: {
    title: RRExpandedKeyPersonProfile.title;
    organizationName: RRExpandedKeyPersonProfile.organizationName;
    department: RRExpandedKeyPersonProfile.department;
    division: RRExpandedKeyPersonProfile.division;
    projectRole: RRExpandedKeyPersonProfile.projectRole;
    otherProjectRoleCategory: RRExpandedKeyPersonProfile.otherProjectRoleCategory;
  };

  /** Enter the person's complete address. */
  address: RRExpandedKeyPersonProfile.address;

  /** Enter the person's phone, fax and email. Phone and email are required. */
  @UI.label("Contact Information")
  contact: {
    phone: RRExpandedKeyPersonProfile.phone;
    fax: RRExpandedKeyPersonProfile.fax;
    email: RRExpandedKeyPersonProfile.email;
  };

  /** Enter the person's agency credential, if they have one, and their highest degree. */
  @UI.label("Credentials")
  credentials: {
    credential: RRExpandedKeyPersonProfile.credential;
    degreeType: RRExpandedKeyPersonProfile.degreeType;
    degreeYear: RRExpandedKeyPersonProfile.degreeYear;
  };

  /** Attach the person's biographical sketch and current & pending support. */
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
  /** Enter the profile of the Project Director/Principal Investigator (PD/PI). */
  @UI.label("PD/PI Profile")
  @UI.field(RRKeyPersonExpanded.principalInvestigator)
  principalInvestigator: {
    @UI.field(RRExpandedKeyPersonEntry.profile)
    @UI.flatten
    profile: RRExpandedKeyPersonProfileLayout;
  };

  /** Enter a profile for each senior/key person on the project, up to 99. */
  @UI.label("Senior/Key Person Profiles")
  @UI.field(RRKeyPersonExpanded.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.field(RRExpandedKeyPersonEntry.profile)
    @UI.flatten
    profile: RRExpandedKeyPersonProfileLayout;
  };

  /** If the project has more than 99 senior/key persons, attach the rest of their profiles and supporting documents, each kind in a single file. */
  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: RRKeyPersonExpanded.additionalProfiles;
    additionalBiographicalSketches: RRKeyPersonExpanded.additionalBiographicalSketches;
    additionalCurrentPendingSupport: RRKeyPersonExpanded.additionalCurrentPendingSupport;
  };
}
