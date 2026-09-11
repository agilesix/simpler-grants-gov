"""The generated Key Contacts' XML mapping against Key_Contacts_2_0-V2.0.xsd.

The mapping is the one `key_contacts` uses: the two forms' response fields are identical,
name for name, so the rules transfer without a rename. It is complete through the
repeatable `RoleOnProject` section.

No recorded gaps -- and unlike `key_contacts`, which records two, that is not an accident
of what is checked. Both of its gaps are absent here:

- `ContactAddress.Country/enum`: the hand-written form offers `CIV: CÔTE D'IVOIRE` with
  U+00D4, which `codes:CountryCodeDataType` does not list. The generated form's country
  enum is the code list itself, so all 261 members match.
- `ContactEmail/minLength`: `globLib:EmailDataType` bounds the element at 1, and the
  hand-written form declares no minimum, so it accepts an empty string the element cannot
  carry. The generated form declares `minLength: 1`.

The registers are empty because there is nothing to explain, and the checks fail rather
than pass if that stops being true.
"""

from ..mapping import WireMapping

MAPPING = WireMapping(module="key_contacts_portable")
