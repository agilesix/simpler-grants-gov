"""How SF-424's inputs correspond to the hand-written form's.

The naming projection is mechanical -- camelCase to snake_case -- so all but a handful of
fields land where you would expect. Every path here is checked against both schemas, so an
entry naming a field either form lacks fails, and any input this file leaves out fails too.
"""

from ..mapping import FormMapping

MAPPING = FormMapping(
    generated_module="sf424_portable",
    handwritten_module="sf424",
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
        "authorized_representative_email/maxLength": (
            "SF424_4_0-V4.0.xsd types AuthorizedRepresentativeEmail as globLib:EmailDataType, and "
            "GlobalLibrary-V2.0.xsd defines that type as minLength 1, maxLength 60. The hand- "
            "written form omits the cap, so it accepts an address the submission cannot carry."
        ),
    },
)
