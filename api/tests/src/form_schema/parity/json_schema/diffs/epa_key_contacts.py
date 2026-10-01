"""How EPA Key Contacts's inputs correspond to the hand-written form's.

Naming is mechanical -- camelCase to snake_case -- so a field lands where you would expect
unless `renamed` says otherwise.

The four contacts are the same question asked four times, so every entry below repeats four
times with only the role changing.
"""

from ..harness.form_diff import FormDiff

_CONTACTS = ("authorized_representative", "payee", "administrative_contact", "project_manager")

_UNRENDERED_ADDRESS_MEMBER = (
    "The generated form composes the shared `generics/address` question, which carries County "
    "and Province because globLib:AddressDataTypeV3 does. This form renders neither -- "
    "`@UI.overrides` omits them -- but the omission reaches the UI schema only, so the JSON "
    "schema still accepts a member no applicant can enter and the XML transform does not map. "
    "The generated form is the one to fix: a form's schema states what an applicant may submit. "
    "Fixing it needs a schema-level omit, which the specification library does not yet offer; "
    "until then the extra member is inert rather than harmful."
)

_EMAIL_MIN_LENGTH = (
    "GlobalLibrary-V2.0.xsd defines globLib:EmailDataType as minLength 1, maxLength 60, and the "
    "hand-written form declares neither bound. The generated form declares both. Recorded "
    "against Key Contacts for the same shared type; this form reaches it through the same "
    "`generics/email` question."
)

_COUNTRY_ENUM = (
    "UniversalCodes-V2.0.xsd declares CIV with an accented O and a curly apostrophe. The "
    "hand-written form carries an accented O with a straight apostrophe, which matches no entry "
    "in the official code list. Recorded against Key Contacts for the same shared code list."
)

DIFF = FormDiff(
    generated_module="epa_key_contacts_portable",
    handwritten_module="epa_key_contacts",
    absent_from_source={
        f"{contact}.address.{member}": _UNRENDERED_ADDRESS_MEMBER
        for contact in _CONTACTS
        for member in ("county", "province")
    },
    differing_rules={
        **{f"{contact}.email/minLength": _EMAIL_MIN_LENGTH for contact in _CONTACTS},
        **{f"{contact}.address.country/enum": _COUNTRY_ENUM for contact in _CONTACTS},
    },
)
