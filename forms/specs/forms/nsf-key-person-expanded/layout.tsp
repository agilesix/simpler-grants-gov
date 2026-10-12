import "simpler-forms";
import "./form.tsp";

using SimplerForms;

namespace Forms.NSFKeyPersonExpanded;

/** The PD/PI's profile, in the groups every key-person form shares. */
model NSFPrincipalInvestigatorProfileLayout {
  name: NSFPrincipalInvestigatorProfile.name;

  @UI.label("Role")
  role: {
    title: NSFPrincipalInvestigatorProfile.title;
    organizationName: NSFPrincipalInvestigatorProfile.organizationName;
    department: NSFPrincipalInvestigatorProfile.department;
    division: NSFPrincipalInvestigatorProfile.division;
    projectRole: NSFPrincipalInvestigatorProfile.projectRole;
  };

  address: NSFPrincipalInvestigatorProfile.address;

  @UI.label("Contact Information")
  contact: {
    phone: NSFPrincipalInvestigatorProfile.phone;
    fax: NSFPrincipalInvestigatorProfile.fax;
    email: NSFPrincipalInvestigatorProfile.email;
  };

  @UI.label("Credentials")
  credentials: {
    nsfId: NSFPrincipalInvestigatorProfile.nsfId;
  };

  @UI.label("Attachments")
  attachments: {
    biographicalSketch: NSFPrincipalInvestigatorProfile.biographicalSketch;
    currentPendingSupport: NSFPrincipalInvestigatorProfile.currentPendingSupport;
    collaborators: NSFPrincipalInvestigatorProfile.collaborators;
    synergisticActivities: NSFPrincipalInvestigatorProfile.synergisticActivities;
  };
}

/** A senior/key person's profile, in the groups every key-person form shares. */
model NSFSeniorKeyPersonProfileLayout {
  name: NSFSeniorKeyPersonProfile.name;

  @UI.label("Role")
  role: {
    title: NSFSeniorKeyPersonProfile.title;
    organizationUei: NSFSeniorKeyPersonProfile.organizationUei;
    department: NSFSeniorKeyPersonProfile.department;
    division: NSFSeniorKeyPersonProfile.division;
    projectRole: NSFSeniorKeyPersonProfile.projectRole;
  };

  address: NSFSeniorKeyPersonProfile.address;

  @UI.label("Contact Information")
  contact: {
    phone: NSFSeniorKeyPersonProfile.phone;
    fax: NSFSeniorKeyPersonProfile.fax;
    email: NSFSeniorKeyPersonProfile.email;
  };

  @UI.label("Credentials")
  credentials: {
    nsfId: NSFSeniorKeyPersonProfile.nsfId;
  };

  @UI.label("Attachments")
  attachments: {
    biographicalSketch: NSFSeniorKeyPersonProfile.biographicalSketch;
    currentPendingSupport: NSFSeniorKeyPersonProfile.currentPendingSupport;
    collaborators: NSFSeniorKeyPersonProfile.collaborators;
    synergisticActivities: NSFSeniorKeyPersonProfile.synergisticActivities;
  };
}

// The paper form's sections: the PD/PI, the other senior/key persons, then the attachments
// for anyone the form has no room for.
@Meta.form(#{
  id: "nsf-key-person-expanded",
  formName: "NSF Senior/Key Person Profile (Expanded)",
})
@UI.layout(NSFKeyPersonExpanded)
model NSFKeyPersonExpandedLayout {
  @UI.label("PD/PI Profile")
  @UI.field(NSFKeyPersonExpanded.principalInvestigator)
  principalInvestigator: {
    @UI.field(NSFPrincipalInvestigator.profile)
    @UI.flatten
    profile: NSFPrincipalInvestigatorProfileLayout;
  };

  @UI.label("Senior/Key Person Profiles")
  @UI.field(NSFKeyPersonExpanded.seniorKeyPersons)
  seniorKeyPersons: {
    @UI.field(NSFSeniorKeyPerson.profile)
    @UI.flatten
    profile: NSFSeniorKeyPersonProfileLayout;
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
