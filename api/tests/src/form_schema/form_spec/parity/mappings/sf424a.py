"""How SF-424A's inputs correspond to the hand-written form's.

The naming projection is mechanical -- camelCase to snake_case -- so all but a handful of
fields land where you would expect. Every path here is checked against both schemas, so an
entry naming a field either form lacks fails, and any input this file leaves out fails too.
"""

from ..mapping import FormMapping

MAPPING = FormMapping(
    generated_module="sf424a_portable",
    handwritten_module="sf424a",
    # Rules where the hand-written form disagrees with the official Grants.gov schema,
    # and the schema says the hand-written one is wrong. Each is a defect for Simpler
    # Grants to fix; recording it keeps the suite green meanwhile, and stale_entries
    # fails if the input it names stops existing.
    upstream_rule_defects={
        "direct_charges_explanation/minLength": (
            "SF424A-V1.0.xsd types OtherDirectChargesExplanation as glob:StringMin1Max50Type, and "
            "Global-V1.0.xsd defines that type as minLength 1, maxLength 50. The hand-written "
            "form declares minLength 0, permitting an empty string the submission would reject."
        ),
        "indirect_charges_explanation/minLength": (
            "SF424A-V1.0.xsd types OtherIndirectChargesExplanation as glob:StringMin1Max50Type, "
            "which Global-V1.0.xsd gives minLength 1. The hand-written form declares minLength 0."
        ),
        "remarks/minLength": (
            "SF424A-V1.0.xsd types Remarks as glob:StringMin1Max250Type, which Global-V1.0.xsd "
            "gives minLength 1. The hand-written form declares minLength 0."
        ),
        "activity_line_items.[].assistance_listing_number/minLength": (
            "SF424A-V1.0.xsd types CFDANumber as glob:StringMin1Max15Type, which Global-V1.0.xsd "
            "gives minLength 1. The hand-written form declares minLength 0."
        ),
        "activity_line_items.[].activity_title/minLength": (
            "NOT backed by the XSD, unlike the four above. SF424A-V1.0.xsd declares no element "
            "for an activity title at all -- a Section A row is identified on the wire by "
            "CFDANumber -- so the free-text programme name is never submitted and neither "
            "minLength can be checked against a source. Ours rejects an empty string and theirs "
            "accepts one; which is right is a judgement about the paper form, not a reading of "
            "the schema."
        ),
    },
)
