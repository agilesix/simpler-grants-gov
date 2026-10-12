import "simpler-forms";
import "../index.tsp";
import "../../questions/organization/index.tsp";
import "../../questions/person/index.tsp";
import "../../questions/research/index.tsp";

using SimplerForms;

namespace Forms.NSFKeyPersonExpanded;

/** `ProjectRoleDataType` in NSF_KeyPersonExpanded_3_3-V3.3.xsd. */
@UI.label("Project Role")
enum NSFProjectRole {
  pdPi: "PD/PI",
  coPdPi: "Co-PD/PI",
  otherSeniorPersonnel: "Other Senior Personnel",
}

/** Enter the person's NSF ID, if they have one. */
@UI.label("NSF ID")
@pattern("[0-9A-Z]{9}")
scalar NSFID extends string;

// The PD/PI's and each senior/key person's profiles are different XSD types that differ in
// one field: the organization's name, or its UEI.

/** The PD/PI's profile. */
model NSFPrincipalInvestigatorProfile {
  name: Questions.People.PersonName;
  title?: Questions.People.ContactTitle;
  department?: Questions.Organizations.DepartmentName;
  organizationName?: Questions.Organizations.OrganizationName;
  division?: Questions.Organizations.DivisionName;
  address: Questions.People.PersonAddress;
  phone: Questions.Types.PhoneNumber;
  fax?: Questions.Types.FaxNumber;
  email: Questions.Types.EmailAddress;
  projectRole: NSFProjectRole;
  nsfId?: NSFID;
  biographicalSketch: Questions.Research.BiographicalSketch;
  currentPendingSupport: Questions.Research.CurrentPendingSupport;
  collaborators: Questions.Research.Collaborators;
  synergisticActivities: Questions.Research.SynergisticActivities;
}

/** A senior/key person's profile, which gives the organization's UEI instead of its name. */
model NSFSeniorKeyPersonProfile {
  name: Questions.People.PersonName;
  title?: Questions.People.ContactTitle;
  department?: Questions.Organizations.DepartmentName;
  organizationUei?: Questions.Organizations.OrganizationUei;
  division?: Questions.Organizations.DivisionName;
  address: Questions.People.PersonAddress;
  phone: Questions.Types.PhoneNumber;
  fax?: Questions.Types.FaxNumber;
  email: Questions.Types.EmailAddress;
  projectRole: NSFProjectRole;
  nsfId?: NSFID;
  biographicalSketch: Questions.Research.BiographicalSketch;
  currentPendingSupport: Questions.Research.CurrentPendingSupport;
  collaborators: Questions.Research.Collaborators;
  synergisticActivities: Questions.Research.SynergisticActivities;
}

/** A person on the form, holding their profile as the XSD's `Profile` element does. */
model NSFPrincipalInvestigator {
  profile: NSFPrincipalInvestigatorProfile;
}

/** A person on the form, holding their profile as the XSD's `Profile` element does. */
model NSFSeniorKeyPerson {
  profile: NSFSeniorKeyPersonProfile;
}
