import "simpler-forms";
import "../index.tsp";

using SimplerForms;

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
