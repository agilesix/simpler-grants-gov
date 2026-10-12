import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.RRKeyPerson;

/** One person's profile, in the groups every key-person form shares. */
model RRKeyPersonProfileLayout {
  /** Enter the person's name. First and last name are required. */
  name: RRKeyPersonProfile.name;

  /** Enter the person's position, organization and role on the project. */
  @UI.label("Role")
  role: {
    title: RRKeyPersonProfile.title;
    organizationName: RRKeyPersonProfile.organizationName;
    department: RRKeyPersonProfile.department;
    division: RRKeyPersonProfile.division;
    projectRole: RRKeyPersonProfile.projectRole;
    otherProjectRoleCategory: RRKeyPersonProfile.otherProjectRoleCategory;
  };

  /** Enter the person's complete address. */
  address: RRKeyPersonProfile.address;

  /** Enter the person's phone, fax and email. Phone and email are required. */
  @UI.label("Contact Information")
  contact: {
    phone: RRKeyPersonProfile.phone;
    fax: RRKeyPersonProfile.fax;
    email: RRKeyPersonProfile.email;
  };

  /** Enter the person's agency credential, if they have one. */
  @UI.label("Credentials")
  credentials: {
    credential: RRKeyPersonProfile.credential;
  };

  /** Attach the person's biographical sketch and current & pending support. */
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
  /** Enter the profile of the Project Director/Principal Investigator (PD/PI). */
  @UI.label("PD/PI Profile")
  @UI.field(RRKeyPerson.principalInvestigator)
  principalInvestigator: {
    @UI.field(RRKeyPersonEntry.profile)
    @UI.flatten
    profile: RRKeyPersonProfileLayout;
  };

  /** Enter a profile for each senior/key person on the project, up to 7. */
  @UI.label("Senior/Key Person Profiles")
  @UI.field(RRKeyPerson.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.field(RRKeyPersonEntry.profile)
    @UI.flatten
    profile: RRKeyPersonProfileLayout;
  };

  /** If the project has more than 7 senior/key persons, attach the rest of their profiles and supporting documents, each kind in a single file. */
  @UI.label("Additional Profiles and Attachments")
  additional: {
    additionalProfiles: RRKeyPerson.additionalProfiles;
    additionalBiographicalSketches: RRKeyPerson.additionalBiographicalSketches;
    additionalCurrentPendingSupport: RRKeyPerson.additionalCurrentPendingSupport;
  };
}
