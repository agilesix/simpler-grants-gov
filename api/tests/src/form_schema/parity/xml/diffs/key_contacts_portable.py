"""The generated Key Contacts' XML mapping against Key_Contacts_2_0-V2.0.xsd.

The mapping `key_contacts` uses: the two forms' response fields are identical name for
name, so the rules transfer without a rename. Complete through the repeatable
`RoleOnProject` section.

All registers are empty, where `key_contacts` records two. Both are absent here:

    ContactAddress.Country/enum   the hand-written form offers `CIV: CÔTE D'IVOIRE` with
                                  U+00D4, which `codes:CountryCodeDataType` does not list.
                                  The generated form's enum is the code list itself.

    ContactEmail/minLength        `globLib:EmailDataType` bounds the element at 1 and the
                                  hand-written form declares no minimum. The generated
                                  form declares `minLength: 1`.
"""

from ..harness.form_diff import FormDiff

DIFF = FormDiff(module="key_contacts_portable")
