import "simpler-forms";
import "../index.tsp";

using SimplerForms;

namespace Questions.Types;

// `globLib:TelephoneNumberDataType`, for a phone number and, extended, for a fax number.
/** Enter the daytime Telephone Number. */
@Meta.question(#{ id: "types/contact-info/phone-number" })
@Meta.tag(TagName.phone)
@UI.label("Phone Number")
@minLength(1)
@maxLength(25)
scalar PhoneNumber extends string;

/** Enter the Fax Number. */
@Meta.question(#{ id: "types/contact-info/fax-number" })
@Meta.tag(TagName.phone)
@UI.label("Fax Number")
scalar FaxNumber extends PhoneNumber;

// `globLib:EmailDataType` is minLength 1, maxLength 60, so both bounds are declared here.
/** Enter a valid email Address. */
@Meta.question(#{ id: "types/contact-info/email-address" })
@Meta.tag(TagName.email)
@UI.label("Email")
@format("email")
@minLength(1)
@maxLength(60)
scalar EmailAddress extends string;
