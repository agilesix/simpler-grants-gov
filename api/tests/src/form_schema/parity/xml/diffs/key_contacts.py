"""Key Contacts' XML mapping against Key_Contacts_2_0-V2.0.xsd.

The mapping is complete, including through the repeatable `RoleOnProject` section. Two
constraint gaps, both in shared global-library types.
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
