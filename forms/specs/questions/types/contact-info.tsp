import "simpler-forms";
import "#questions/index.tsp";

using SimplerForms;

namespace Questions.Types;

// `globLib:TelephoneNumberDataType` and `globLib:EmailDataType`, which every phone, fax and
// email question extends: `PersonPhoneNumber`, and in time an `OrgPhoneNumber`.
/** Enter the daytime Telephone Number. */
@Meta.question(#{ id: "types/contact-info/phone-number" })
@Meta.tag(TagName.phone)
@UI.label("Phone Number")
@minLength(1)
@maxLength(25)
scalar PhoneNumber extends string;

// `globLib:EmailDataType` is minLength 1, maxLength 60, so both bounds are declared here.
/** Enter a valid email Address. */
@Meta.question(#{ id: "types/contact-info/email-address" })
@Meta.tag(TagName.email)
@UI.label("Email")
@format("email")
@minLength(1)
@maxLength(60)
scalar EmailAddress extends string;
