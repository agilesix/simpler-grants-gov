"""How Key Contacts's inputs correspond to the hand-written form's.

The naming projection is mechanical -- camelCase to snake_case -- so all but a handful of
fields land where you would expect. Every path here is checked against both schemas, so an
entry naming a field either form lacks fails, and any input this file leaves out fails too.
"""

from ..mapping import FormMapping

MAPPING = FormMapping(
    generated_module="key_contacts_portable",
    handwritten_module="key_contacts",
    # Rules where the hand-written form disagrees with the official Grants.gov schema,
    # and the schema says the hand-written one is wrong. Each is a defect for Simpler
    # Grants to fix; recording it keeps the suite green meanwhile, and stale_entries
    # fails if the input it names stops existing.
    upstream_rule_defects={
        "key_contacts.[].email/minLength": (
            "GlobalLibrary-V2.0.xsd defines globLib:EmailDataType as minLength 1, maxLength "
            "60, and the hand-written form declares neither bound on this field. The generated "
            "form declares both. `format: email` already rejects the empty string, so the "
            "minimum changes no verdict today -- it is declared because the Grants.gov type "
            "states it, and a constraint that holds only as a side effect of another assertion "
            "is one nobody notices losing."
        ),
        "key_contacts.[].address.country/enum": (
            "UniversalCodes-V2.0.xsd (sha256 78f33338e9319ef3...) declares two entries for CIV: "
            "one with no accent and a straight apostrophe, one with an accented O and a curly "
            "apostrophe. The hand-written form carries a third spelling -- accented O with a "
            "straight apostrophe -- taking the accent from one and the apostrophe from the other, "
            "so it matches neither. Selecting that country on the form that ships today produces "
            "a value the official code list does not contain."
        ),
    },
)
