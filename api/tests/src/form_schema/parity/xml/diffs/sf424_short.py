"""SF-424 Short's XML mapping against SF424_Short_3_0-V3.0.xsd.

The mapping is complete: all eighty-two elements mapped in sequence order, every rule
reading a real field, every field reaching an element. Six constraint gaps, all in the
shared global-library country and email types.
"""

from ..harness.form_diff import FormDiff
from .shared_conflicts import CIV, EMPTY_EMAIL

DIFF = FormDiff(
    module="sf424_short",
    differing_rules={
        "Address.Country/enum": CIV,
        "ProjectDirectorGroup.Address.Country/enum": CIV,
        "ContactPersonGroup.Address.Country/enum": CIV,
        "ProjectDirectorGroup.Email/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
        "ContactPersonGroup.Email/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
        "AuthorizedRepresentativeEmail/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
    },
)
