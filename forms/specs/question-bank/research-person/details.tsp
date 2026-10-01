import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./biographical-sketch.tsp";
import "./credential.tsp";
import "./current-pending-support.tsp";
import "./degree-type.tsp";
import "./degree-year.tsp";
import "./name.tsp";
import "./other-project-role.tsp";
import "./project-role.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.ResearchPerson;

/**
 * Identity, affiliation, contact details, role, credential and supporting documents for one
 * senior or key person on a research project.
 *
 * Deliberately not `poc/details` with extra fields. A point of contact is someone to ask
 * about the application; a senior/key person is someone the award is evaluated on, which is
 * why this one carries a degree, a credential and a biographical sketch, and why its role is
 * a closed list. The two share a shape and mean different things.
 */
@Meta.question(#{
  id: "research-person/details",
  entity: EntityName.principalInvestigator,
})
@Meta.tag(TagName.person, TagName.details)
@UI.label("Senior / Key Person")
model QuestionResearchPersonProfile {
  /** Enter the person's name. First and last name are required. */
  @UI.label("Name")
  name: QuestionResearchPersonName;

  /** Enter the person's position or title. */
  @UI.label("Position / Title")
  title?: ContactTitle;

  /** Enter the department this person belongs to. */
  @UI.label("Department")
  @minLength(1)
  @maxLength(100)
  department?: string;

  /** Enter the name of the organization this person belongs to. */
  @UI.label("Organization Name")
  organizationName?: OrganizationName;

  /** Enter the division this person belongs to. */
  @UI.label("Division")
  @minLength(1)
  @maxLength(100)
  division?: string;

  // The nine-digit variant: the R&R instructions say nine digits where SF-424's do not.
  /** Enter the person's address. */
  @UI.label("Address")
  @Validation.requiredPaths("street1", "city", "country")
  @Validation.requiredPathWhen("state", "country", CountryCode.USA)
  @Validation.requiredPathWhen("zipCode", "country", CountryCode.USA)
  address: QuestionAddressNineDigitZip;

  /** Enter the person's telephone number. */
  @UI.label("Phone Number")
  phone: PhoneNumber;

  /** Enter the person's fax number. */
  @UI.label("Fax Number")
  fax?: PhoneNumber;

  /** Enter the person's email address. */
  @UI.label("Email")
  email: EmailAddress;

  /** Enter the person's agency credential or login, when applicable. */
  @UI.label("Credential, e.g., agency login")
  credential?: ResearchPersonCredential;

  /** Select this person's role on the project. */
  @UI.label("Project Role")
  projectRole: ResearchProjectRole;

  /** Name the role when one of the Other categories is selected. */
  @UI.label("Other Project Role Category")
  @Validation.requiredWhen(
    QuestionResearchPersonProfile.projectRole,
    ResearchProjectRole.otherProfessional
  )
  @Validation.requiredWhen(
    QuestionResearchPersonProfile.projectRole,
    ResearchProjectRole.other
  )
  @UI.enabledWhenAny(
    QuestionResearchPersonProfile.projectRole,
    ResearchProjectRole.otherProfessional,
    ResearchProjectRole.other
  )
  otherProjectRole?: ResearchPersonOtherProjectRole;

  /** Enter the type of degree this person holds. */
  @UI.label("Degree Type")
  degreeType?: ResearchPersonDegreeType;

  /** Enter the year this person's degree was awarded. */
  @UI.label("Degree Year")
  degreeYear?: ResearchPersonDegreeYear;

  /** Attach this person's biographical sketch. */
  @UI.label("Attach Biographical Sketch")
  @UI.widget(WidgetName.Attachment)
  biographicalSketch?: ResearchPersonBiographicalSketch;

  /** Attach this person's current and pending support. */
  @UI.label("Attach Current & Pending Support")
  @UI.widget(WidgetName.Attachment)
  currentPendingSupport?: ResearchPersonCurrentPendingSupport;
}
