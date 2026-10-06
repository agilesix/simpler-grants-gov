import "simpler-forms";
import "../index.tsp";
import "./codes.tsp";

using SimplerForms;

namespace Questions.Types;

/** The parts of an address, one scalar per field. */
namespace AddressParts {
  /** Enter the first line of the Street Address. */
  @Meta.question(#{ id: "types/address/street-1" })
  @minLength(1)
  @maxLength(55)
  scalar Street1 extends string;

  /** Enter the second line of the Street Address. */
  @Meta.question(#{ id: "types/address/street-2" })
  @minLength(1)
  @maxLength(55)
  scalar Street2 extends string;

  /** Enter the city. */
  @Meta.question(#{ id: "types/address/city" })
  @minLength(1)
  @maxLength(35)
  scalar City extends string;

  /** Enter the County or Parish. */
  @Meta.question(#{ id: "types/address/county" })
  @minLength(1)
  @maxLength(30)
  scalar County extends string;

  /** Enter the province. */
  @Meta.question(#{ id: "types/address/province" })
  @minLength(1)
  @maxLength(30)
  scalar Province extends string;

  /** Enter the Zip / Postal Code. */
  @Meta.question(#{ id: "types/address/zip-code" })
  @minLength(1)
  @maxLength(30)
  scalar ZipCode extends string;
}

// State and Province are alternatives, not independent fields. `AddressDataTypeV3` in
// GlobalLibrary-V2.0.xsd wraps them in an `xs:choice`, so the rule lives on the question
// rather than on each form: State is enabled only for a US address, Province is hidden for one.
/** Enter an address. */
@Meta.question(#{ id: "types/address" })
@Meta.tag(TagName.address)
@UI.label("Address")
model Address {
  /** Enter the first line of the Street Address. */
  @UI.label("Street 1")
  street1?: Questions.Types.AddressParts.Street1;

  /** Enter the second line of the Street Address. */
  @UI.label("Street 2")
  street2?: Questions.Types.AddressParts.Street2;

  /** Enter the city. */
  @UI.label("City")
  city?: Questions.Types.AddressParts.City;

  /** Enter the County or Parish. */
  @UI.label("County/Parish")
  county?: Questions.Types.AddressParts.County;

  /** Enter the state. */
  @UI.label("State")
  @UI.enabledWhen(Address.country, Questions.Types.CountryCode.USA)
  state?: Questions.Types.StateCode;

  /** Enter the province. */
  @UI.label("Province")
  @UI.hiddenWhen(Address.country, Questions.Types.CountryCode.USA)
  province?: Questions.Types.AddressParts.Province;

  /** Enter the country. */
  @UI.label("Country")
  country?: Questions.Types.CountryCode;

  /** Enter the nine-digit Postal Code (e.g., ZIP Code). This field is required if the Country is the United States. */
  @UI.label("Zip / Postal Code")
  zipCode?: Questions.Types.AddressParts.ZipCode;
}
