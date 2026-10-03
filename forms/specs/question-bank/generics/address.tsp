import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;

namespace QuestionBank.Generics;

// State and Province are alternatives, not independent fields. `AddressDataTypeV3` in
// GlobalLibrary-V2.0.xsd wraps them in an `xs:choice`, so an address carrying both cannot be
// represented on the wire at all -- and the source rules for every form that uses this type
// say the same thing twice: State is "active if Country is US, inactive otherwise" and
// Province is "inactive if Country is US, active otherwise".
//
// The rule therefore lives on the question rather than on each form. Every form asking for an
// address asks for the same one, and a renderer honoring these two conditions cannot produce
// the both-populated combination.
//
// Province is hidden for a US address rather than disabled. Either keeps it empty on the wire;
// hiding it also keeps a field that cannot apply off a US applicant's screen.
/** Enter an address. */
@Meta.question(#{ id: "generics/address", entity: EntityName.generic })
@Meta.tag(TagName.address)
@UI.label("Address")
model QuestionAddress {
  /** Enter the first line of the Street Address. */
  @UI.label("Street 1")
  @minLength(1)
  @maxLength(55)
  street1?: string;

  /** Enter the second line of the Street Address. */
  @UI.label("Street 2")
  @minLength(1)
  @maxLength(55)
  street2?: string;

  /** Enter the city. */
  @UI.label("City")
  @minLength(1)
  @maxLength(35)
  city?: string;

  /** Enter the County or Parish. */
  @UI.label("County/Parish")
  @minLength(1)
  @maxLength(30)
  county?: string;

  /** Enter the state. */
  @UI.label("State")
  @UI.enabledWhen(QuestionAddress.country, CountryCode.USA)
  state?: StateCode;

  /** Enter the province. */
  @UI.label("Province")
  @minLength(1)
  @maxLength(30)
  @UI.hiddenWhen(QuestionAddress.country, CountryCode.USA)
  province?: string;

  /** Enter the country. */
  @UI.label("Country")
  country?: CountryCode;

  /** Enter the nine-digit Postal Code (e.g., ZIP Code). This field is required if the Country is the United States. */
  @UI.label("Zip / Postal Code")
  @minLength(1)
  @maxLength(30)
  zipCode?: string;
}

/**
 * The same address, asked with the stricter of the two US postal-code rules in circulation.
 *
 * `ZipPostalCodeDataType` in GlobalLibrary-V2.0.xsd bounds the field at 1..30 characters and
 * says nothing about nine digits, so this is not a structural constraint -- it comes from the
 * form instructions, which read "Enter the nine-digit Postal Code (e.g., ZIP Code)". Forms
 * disagree about whether they mean it: some accept a five-digit ZIP, and the R&R family does
 * not.
 *
 * A separate question rather than a tightening of `generics/address`, for the reason
 * `MonetaryAmountMax12Digits` is separate from `MonetaryAmount`: moving the rule onto the
 * shared address would silently raise the bar for every form already asking for one, and a
 * form that accepts a five-digit ZIP is not asking this question badly, it is asking a
 * different question. Named for the rule rather than for the forms that currently hold it.
 */
@Meta.question(#{
  id: "generics/address-nine-digit-zip",
  entity: EntityName.generic,
})
@Meta.tag(TagName.address)
@UI.label("Address")
model QuestionAddressNineDigitZip extends QuestionAddress {
  /** Enter the nine-digit Postal Code (e.g., ZIP Code). This field is required if the Country is the United States. */
  @UI.label("Zip / Postal Code")
  @minLength(1)
  @maxLength(30)
  @Validation.constraintsWhen(
    QuestionAddressNineDigitZip.country,
    CountryCode.USA,
    #{ minLength: 9 }
  )
  zipCode?: string;
}
