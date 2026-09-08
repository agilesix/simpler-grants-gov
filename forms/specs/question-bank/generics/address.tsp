import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

/** Enter an address. */
@Meta.question(#{ id: "generics/address",
  entity: EntityName.generic,
})
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
  state?: StateCode;

  /** Enter the province. */
  @UI.label("Province")
  @minLength(1)
  @maxLength(30)
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
