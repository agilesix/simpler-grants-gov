import "simpler-forms";
import "../index.tsp";
import "../../questions/organization/index.tsp";
import "../../questions/person/index.tsp";
import "../../questions/research/index.tsp";

using SimplerForms;

namespace Forms.RRKeyPersonExpanded;

/** `ProjectRoleDataType` in RR_KeyPersonExpanded_4_0-V4.0.xsd. */
@UI.label("Project Role")
enum RRExpandedProjectRole {
  pdPi: "PD/PI",
  coPdPi: "Co-PD/PI",
  faculty: "Faculty",
  postDoctoral: "Post Doctoral",
  postDoctoralAssociate: "Post Doctoral Associate",
  postDoctoralScholar: "Post Doctoral Scholar",
  otherProfessional: "Other Professional",
  graduateStudent: "Graduate Student",
  undergraduateStudent: "Undergraduate Student",
  technician: "Technician",
  consultant: "Consultant",
  coInvestigator: "Co-Investigator",
  otherSpecify: "Other (Specify)",
}

/** Enter the highest academic or professional degree or other credentials (e.g., RN). */
@UI.label("Degree Type")
@minLength(1)
@maxLength(75)
scalar DegreeType extends string;

/** Enter the year the highest degree or other credential was obtained. */
@UI.label("Degree Year")
@minLength(1)
@maxLength(25)
scalar DegreeYear extends string;

/** One person's profile. The PD/PI and each senior/key person share it. */
model RRExpandedKeyPersonProfile {
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
  projectRole: RRExpandedProjectRole;

  @UI.enabledWhenAny(RRExpandedKeyPersonProfile.projectRole, RRExpandedProjectRole.otherProfessional, RRExpandedProjectRole.otherSpecify)
  otherProjectRoleCategory?: Questions.Research.OtherProjectRoleCategory;

  degreeType?: DegreeType;
  degreeYear?: DegreeYear;
  biographicalSketch?: Questions.Research.BiographicalSketch;
  currentPendingSupport?: Questions.Research.CurrentPendingSupport;
}

/** A person on the form, holding their profile as the XSD's `Profile` element does. */
model RRExpandedKeyPersonEntry {
  profile: RRExpandedKeyPersonProfile;
}
