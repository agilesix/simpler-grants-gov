"""How SF-424's inputs correspond to the hand-written form's.

The naming projection is mechanical -- camelCase to snake_case -- so all but a handful of
fields land where you would expect. Every path here is checked against both schemas, so an
entry naming a field either form lacks fails, and any input this file leaves out fails too.
"""

from ..mapping import FormMapping

_REVISION = (
    "SF424_4_0-V4.0.xsd types RevisionOtherSpecify as minLength 1, maxLength 21, and the "
    "hand-written form declares {keyword}. The generated form matches the schema."
)

# The amount is held as a string so a cent is never lost to binary floating point, which
# means `minimum`/`maximum` say nothing about it and the range has to live in the pattern.
_MONEY = (
    "SF424_4_0-V4.0.xsd bounds {element} to 0.00 .. {cap}. The hand-written form's pattern "
    "permits a leading minus and any number of digits, so it accepts both a negative amount "
    "and one far above the cap; `currency_format` reformats the value without bounding it. "
    "The generated form uses a {digits}-digit non-negative pattern, which expresses exactly "
    "that range -- the same approach `common_shared.py` already takes with "
    "`budget_monetary_amount_non_negative`, which only SF-424C currently uses."
)

_MONEY_LENGTH = (
    "Follows from the pattern: {digits} digits, a decimal point and two more is "
    "{digits} + 3 characters, where the hand-written form's 14 was chosen for a pattern "
    "that bounded nothing. The pattern is the binding constraint either way."
)

MAPPING = FormMapping(
    generated_module="sf424_portable",
    handwritten_module="sf424",
    # Rules where the hand-written form disagrees with the official Grants.gov schema,
    # and the schema says the hand-written one is wrong. Each is a defect for Simpler
    # Grants to fix; recording it keeps the suite green meanwhile, and stale_entries
    # fails if the input it names stops existing.
    upstream_rule_defects={
        "email/minLength": (
            "GlobalLibrary-V2.0.xsd defines globLib:EmailDataType as minLength 1, maxLength "
            "60, and the hand-written form declares neither bound on this field. The generated "
            "form declares both. `format: email` already rejects the empty string, so the "
            "minimum changes no verdict today -- it is declared because the Grants.gov type "
            "states it, and a constraint that holds only as a side effect of another assertion "
            "is one nobody notices losing."
        ),
        "authorized_representative_email/minLength": (
            "GlobalLibrary-V2.0.xsd defines globLib:EmailDataType as minLength 1, maxLength "
            "60, and the hand-written form declares neither bound on this field. The generated "
            "form declares both. `format: email` already rejects the empty string, so the "
            "minimum changes no verdict today -- it is declared because the Grants.gov type "
            "states it, and a constraint that holds only as a side effect of another assertion "
            "is one nobody notices losing."
        ),
        "applicant.country/enum": (
            "UniversalCodes-V2.0.xsd spells CIV with a typographic apostrophe (U+2019) and the "
            "hand-written form spells it with a straight one (U+0027). Nothing else about the "
            "two strings differs. Selecting that country on the form that ships today produces "
            "a value the official code list does not contain."
        ),
        "revision_other_specify/maxLength": _REVISION.format(keyword="no maximum"),
        "revision_other_specify/minLength": _REVISION.format(keyword="no minimum"),
        "division_name/maxLength": (
            "SF424_4_0-V4.0.xsd caps DivisionName at maxLength 30 and the hand-written form "
            "allows 100, so 70 characters an applicant can type cannot be submitted. The "
            "generated form matches the schema."
        ),
        "federal_estimated_funding/pattern": _MONEY.format(
            element="FederalEstimatedFunding", digits=12, cap="999999999999.99"
        ),
        "federal_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="FederalEstimatedFunding", digits=12
        ),
        "applicant_estimated_funding/pattern": _MONEY.format(
            element="ApplicantEstimatedFunding", digits=12, cap="999999999999.99"
        ),
        "applicant_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="ApplicantEstimatedFunding", digits=12
        ),
        "state_estimated_funding/pattern": _MONEY.format(
            element="StateEstimatedFunding", digits=12, cap="999999999999.99"
        ),
        "state_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="StateEstimatedFunding", digits=12
        ),
        "local_estimated_funding/pattern": _MONEY.format(
            element="LocalEstimatedFunding", digits=12, cap="999999999999.99"
        ),
        "local_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="LocalEstimatedFunding", digits=12
        ),
        "other_estimated_funding/pattern": _MONEY.format(
            element="OtherEstimatedFunding", digits=12, cap="999999999999.99"
        ),
        "other_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="OtherEstimatedFunding", digits=12
        ),
        "program_income_estimated_funding/pattern": _MONEY.format(
            element="ProgramIncomeEstimatedFunding", digits=12, cap="999999999999.99"
        ),
        "program_income_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="ProgramIncomeEstimatedFunding", digits=12
        ),
        "total_estimated_funding/pattern": _MONEY.format(
            element="TotalEstimatedFunding", digits=13, cap="9999999999999.99"
        ),
        "total_estimated_funding/maxLength": _MONEY_LENGTH.format(
            element="TotalEstimatedFunding", digits=13
        ),
        "authorized_representative_email/maxLength": (
            "SF424_4_0-V4.0.xsd types AuthorizedRepresentativeEmail as globLib:EmailDataType, and "
            "GlobalLibrary-V2.0.xsd defines that type as minLength 1, maxLength 60. The hand- "
            "written form omits the cap, so it accepts an address the submission cannot carry."
        ),
    },
)
