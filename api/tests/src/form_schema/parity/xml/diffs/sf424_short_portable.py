"""The generated SF-424 Short's XML mapping against SF424_Short_3_0-V3.0.xsd.

`sf424_short`'s mapping with one rename: the generated form calls the project director's
and contact person's telephone `phone` where the hand-written form calls it `phone_number`.
Everything else transfers name for name, in sequence order.

All registers are empty, where `sf424_short` records six -- three country enums and three
email bounds, in the same two shared global-library types:

    <...>.Country/enum   the hand-written form offers `CIV: CÔTE D'IVOIRE` with U+00D4,
                         which `codes:CountryCodeDataType` does not list. The generated
                         form's enum is the code list itself.

    <...>Email/minLength `globLib:EmailDataType` bounds each at 1 and the hand-written
                         form declares no minimum. The generated form declares
                         `minLength: 1`.
"""

from ..harness.form_diff import FormDiff

DIFF = FormDiff(module="sf424_short_portable")
