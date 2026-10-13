"""Key Contacts' XML mapping against Key_Contacts_2_0-V2.0.xsd.

Complete, including through the repeatable `RoleOnProject` section. Two `differing_rules`
entries, both in shared global-library types.
"""

from ..harness.form_diff import FormDiff
from .shared_conflicts import CIV, EMPTY_EMAIL

DIFF = FormDiff(
    module="key_contacts",
    differing_rules={
        "RoleOnProject.ContactAddress.Country/enum": CIV,
        "RoleOnProject.ContactEmail/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
    },
)
