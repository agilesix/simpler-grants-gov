import "simpler-forms";
import "../index.tsp";
import "../../questions/organization/index.tsp";
import "../../questions/person/index.tsp";
import "../../questions/research/index.tsp";

using SimplerForms;

namespace Forms.RRKeyPerson;

/** `ProjectRoleDataType` in RR_KeyPerson_3_0-V3.0.xsd. */
@UI.label("Project Role")
enum RRProjectRole {
  pdPi: "PD/PI",
  coPdPi: "Co-PD/PI",
  faculty: "Faculty",
  postDoctoral: "Post Doctoral",
  postDoctoralAssociate: "Post Doctoral Associate",
  otherProfessional: "Other Professional",
  graduateStudent: "Graduate Student",
  undergraduateStudent: "Undergraduate Student",
  technician: "Technician",
  consultant: "Consultant",
  otherSpecify: "Other (Specify)",
}

/** One person's profile. The PD/PI and each senior/key person share it. */
model RRKeyPersonProfile {
  name: Questions.People.PersonName;
  title?: Questions.People.ContactTitle;
  department?: Questions.Organizations.DepartmentName;
  organizationName?: Questions.Organizations.OrganizationName;
  division?: Questions.Organizations.DivisionName;
  address: Questions.People.PersonAddress;
  phone: Questions.Types.PhoneNumber;
  fax?: Questions.Types.FaxNumber;
  email: Questions.Types.EmailAddress;
  credential?: Questions.Research.Credential;
  projectRole: RRProjectRole;

  @UI.enabledWhenAny(RRKeyPersonProfile.projectRole, RRProjectRole.otherProfessional, RRProjectRole.otherSpecify)
  otherProjectRoleCategory?: Questions.Research.OtherProjectRoleCategory;

  biographicalSketch: Questions.Research.BiographicalSketch;
  currentPendingSupport?: Questions.Research.CurrentPendingSupport;
}

/** A person on the form, holding their profile as the XSD's `Profile` element does. */
model RRKeyPersonEntry {
  profile: RRKeyPersonProfile;
}
