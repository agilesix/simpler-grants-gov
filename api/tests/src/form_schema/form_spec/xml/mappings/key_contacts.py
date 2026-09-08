"""Key Contacts' XML mapping against Key_Contacts_2_0-V2.0.xsd.

The mapping is complete, including through the repeatable `RoleOnProject` section. Two
constraint gaps, both in shared global-library types.
"""

from ..mapping import WireMapping
from .constraints import CIV, EMPTY_EMAIL

MAPPING = WireMapping(
    module="key_contacts",
    constraint_gaps={
        "RoleOnProject.ContactAddress.Country/enum": CIV,
        "RoleOnProject.ContactEmail/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
    },
)
