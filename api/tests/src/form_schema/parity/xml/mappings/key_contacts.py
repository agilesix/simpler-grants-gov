"""Key Contacts' XML mapping against Key_Contacts_2_0-V2.0.xsd.

The mapping is complete, including through the repeatable `RoleOnProject` section. Two
constraint gaps, both in shared global-library types.
"""

from ..form_mapping import FormMapping
from .shared_conflicts import CIV, EMPTY_EMAIL

MAPPING = FormMapping(
    module="key_contacts",
    recorded_differences={
        "RoleOnProject.ContactAddress.Country/enum": CIV,
        "RoleOnProject.ContactEmail/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
    },
)
