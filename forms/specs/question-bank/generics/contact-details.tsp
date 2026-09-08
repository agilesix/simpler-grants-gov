import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";
import "./email.tsp";
import "./person-name.tsp";
import "./phone.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/**
 * A person and the ways to reach them.
 *
 * The shape only. Who the person *is* to the application -- a point of contact, the
 * representative authorized to sign -- is a different question, because the roles are not
 * interchangeable and a form asks for both. Those extend this.
 *
 * The person's title is deliberately not here. A point of contact may not have one; a
 * representative authorized to bind the organization does, because their title is how you
 * know they are authorized. So each of those declares it, with the optionality it has.
 */
@Meta.question(#{ id: "generics/contact-details",
  entity: EntityName.generic,
})
@Meta.tag(TagName.person, TagName.details)
@UI.label("Contact")
model QuestionContactDetails {
  /** Enter the name. */
  @UI.label("Name")
  @Validation.requiredPaths("firstName", "lastName")
  name: QuestionPersonName;

  /** Enter the daytime Telephone Number. */
  @UI.label("Telephone Number")
  phone: PhoneNumber;

  /** Enter the Fax Number. */
  @UI.label("Fax Number")
  fax?: PhoneNumber;

  /** Enter a valid email Address. */
  @UI.label("Email")
  email: EmailAddress;
}
