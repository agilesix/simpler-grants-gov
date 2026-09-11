"""The generated SF-424 Short's XML mapping against SF424_Short_3_0-V3.0.xsd.

The mapping is `sf424_short`'s, with one rename: the generated form calls the project
director's and contact person's telephone `phone` where the hand-written form calls it
`phone_number`. Everything else transfers name for name, and all eighty-two elements stay
in sequence order.

No recorded gaps, where `sf424_short` records six. All six are absent here, and each was
checked against the element rather than assumed:

- Three `Country/enum` gaps -- on `Address`, `ProjectDirectorGroup.Address` and
  `ContactPersonGroup.Address`. The hand-written form offers `CIV: CÔTE D'IVOIRE` with
  U+00D4, which `codes:CountryCodeDataType` does not list. The generated form's country
  enum is the code list itself, so all 261 members match.
- Three `Email/minLength` gaps -- on `ProjectDirectorGroup`, `ContactPersonGroup` and
  `AuthorizedRepresentativeEmail`. `globLib:EmailDataType` bounds each at 1 and the
  hand-written form declares no minimum, so it accepts an empty string the element cannot
  carry. The generated form declares `minLength: 1`.

The registers are empty because there is nothing to explain, and the checks fail rather
than pass if that stops being true.
"""

from ..mapping import WireMapping

MAPPING = WireMapping(module="sf424_short_portable")
