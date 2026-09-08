"""How SF-424 Short's inputs correspond to the hand-written form's.

The naming projection is mechanical -- camelCase to snake_case -- so all but a handful of
fields land where you would expect. Every path here is checked against both schemas, so an
entry naming a field either form lacks fails, and any input this file leaves out fails too.
"""

from ..mapping import FormMapping

MAPPING = FormMapping(
    generated_module="sf424_short_portable",
    handwritten_module="sf424_short",
    # The shared contact question calls this `phone`. The hand-written forms are
    # not consistent with each other: SF-424 Short calls it `phone_number` while
    # Key Contacts calls it `phone`. The bank keeps one name and the mapping
    # absorbs the difference, rather than the drift reaching 43 forms.
    renamed={
        "contact_person.phone": "contact_person.phone_number",
        "project_director.phone": "project_director.phone_number",
    },
    # Rules where the hand-written form disagrees with the official Grants.gov schema,
    # and the schema says the hand-written one is wrong. Each is a defect for Simpler
    # Grants to fix; recording it keeps the suite green meanwhile, and stale_entries
    # fails if the input it names stops existing.
    upstream_rule_defects={
        "applicant.country/enum": (
            "UniversalCodes-V2.0.xsd (sha256 78f33338e9319ef3...) declares two entries for CIV: "
            "one with no accent and a straight apostrophe, one with an accented O and a curly "
            "apostrophe. The hand-written form carries a third spelling -- accented O with a "
            "straight apostrophe -- taking the accent from one and the apostrophe from the other, "
            "so it matches neither. Selecting that country on the form that ships today produces "
            "a value the official code list does not contain."
        ),
        "contact_person.address.country/enum": (
            "UniversalCodes-V2.0.xsd (sha256 78f33338e9319ef3...) declares two entries for CIV: "
            "one with no accent and a straight apostrophe, one with an accented O and a curly "
            "apostrophe. The hand-written form carries a third spelling -- accented O with a "
            "straight apostrophe -- taking the accent from one and the apostrophe from the other, "
            "so it matches neither. Selecting that country on the form that ships today produces "
            "a value the official code list does not contain."
        ),
        "project_director.address.country/enum": (
            "UniversalCodes-V2.0.xsd (sha256 78f33338e9319ef3...) declares two entries for CIV: "
            "one with no accent and a straight apostrophe, one with an accented O and a curly "
            "apostrophe. The hand-written form carries a third spelling -- accented O with a "
            "straight apostrophe -- taking the accent from one and the apostrophe from the other, "
            "so it matches neither. Selecting that country on the form that ships today produces "
            "a value the official code list does not contain."
        ),
        "applicant_web_address/format": (
            "SF424_Short_3_0-V3.0.xsd types ApplicantWebAddress as xs:anyURI. The hand-written "
            "form asserts nothing about the shape of the value."
        ),
    },
)
