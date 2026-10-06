import "simpler-forms";
import "../index.tsp";

using SimplerForms;

// Leaves map to globLib Phone, Fax and Email, grouped so a contact stays shallow.
namespace Questions.Types;

/** A telephone or fax number. */
@Meta.question(#{ id: "types/contact-info/phone-number" })
@Meta.tag(TagName.phone)
@minLength(1)
@maxLength(25)
scalar PhoneNumber extends string;

/**
 * An email address.
 *
 * `globLib:EmailDataType` is minLength 1, maxLength 60, so both bounds are declared here.
 */
@Meta.question(#{ id: "types/contact-info/email-address" })
@Meta.tag(TagName.email)
@format("email")
@minLength(1)
@maxLength(60)
scalar EmailAddress extends string;

/** The ways to reach someone. */
@Meta.question(#{ id: "types/contact-info" })
@UI.label("Contact Information")
model ContactInfo {
  /** Enter the daytime Telephone Number. */
  @UI.label("Telephone Number")
  phone?: Questions.Types.PhoneNumber;

  /** Enter the Fax Number. */
  @UI.label("Fax Number")
  fax?: Questions.Types.PhoneNumber;

  /** Enter a valid email Address. */
  @UI.label("Email")
  email?: Questions.Types.EmailAddress;
}
