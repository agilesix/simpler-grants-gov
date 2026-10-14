"""SF-424A's XML mapping against SF424A-V1.0.xsd.

Skipped by the structural checks. Where the other three nest their rules the way the XSD
nests its elements, this one declares a flat vocabulary of field-to-element names plus
four directives -- `array_decomposition` twice, `pivot_object` and `compose_object` --
that build the structure from `activity_line_items` at run time. Its top-level rule keys
are not top-level elements, so `flatten_transform.read` cannot derive what it emits and
`unreadable` records why.

Until it has a declared wire model, its XML correctness rests on XSD validation alone.
"""

from ..harness.form_diff import FormDiff

DIFF = FormDiff(
    module="sf424a",
    unreadable={
        "budget_sections": "conditional_transform.type 'array_decomposition'",
        "budget_sections_federal_funds": "conditional_transform.type 'array_decomposition'",
        "forecasted_cash_needs": "conditional_transform.type 'pivot_object'",
        "other_information": "conditional_transform.type 'compose_object'",
    },
)
