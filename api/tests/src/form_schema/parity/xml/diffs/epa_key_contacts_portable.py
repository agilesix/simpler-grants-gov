"""The generated EPA Key Contacts' XML mapping against EPA_KeyContacts_2_0-V2.0.xsd.

The mapping the hand-written `epa_key_contacts` uses: the two forms' response fields are
identical name for name, so the rules transfer without a rename. Complete through all four
`globLib:ContactPersonDataTypeV3` contacts.

All registers are empty. The two the JSON-schema side records against this form -- the
`CIV` spelling in the country code list, and the missing `minLength` on email -- are
properties of the hand-written form's JSON schema rather than of either mapping, so
neither appears here.

The XSD spells the third contact `AdminstrativeContact`, without the second `i`. The
mapping reproduces the misspelling because the element name is the wire contract, not a
description of it.
"""

from ..harness.form_diff import FormDiff

DIFF = FormDiff(module="epa_key_contacts_portable")
