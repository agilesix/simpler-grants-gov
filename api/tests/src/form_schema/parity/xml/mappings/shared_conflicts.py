"""Citations shared by more than one form's constraint gaps.

The country code list and the email type are declared once in the Grants.gov global
libraries, so a gap in how a form constrains them repeats across forms.

Each says whether the gap is reachable -- whether an applicant could actually get the
value into a stored response. The checks compare what the two schemas declare and do not
know about reachability, which depends on other declarations they do not read, so that
judgement lives here.
"""

CIV = (
    "Reachable. UniversalCodes-V2.0.xsd spells this country with a typographic apostrophe "
    "(U+2019) and the form offers it with a straight one (U+0027). Nothing else about the "
    "two strings differs, which is why it survives review. An applicant who selects it "
    "produces a value the code list does not contain, demonstrated in "
    "tests/src/services/xml_generation/test_xml_validation_cases.py."
)

EMPTY_EMAIL = (
    "Not reachable, recorded because the declarations do differ. {wire} restricts to "
    "minLength 1 and the form declares no minLength, but the form also asserts "
    "`format: email`, which rejects the empty string -- so no empty answer can be stored "
    "to be submitted. It would become reachable if that format assertion were relaxed, "
    "because `_process_xml_transform_rule` excludes a value only when it is None, not "
    "when it is empty."
)

MAX_EMAIL = (
    "Reachable. globLib:EmailDataType caps at maxLength 60 and the form declares no "
    "maximum, so it accepts an address the element cannot carry -- a 64-character address "
    "satisfies `format: email` and is rejected by the schema. The parity suite records the "
    "same inconsistency from the form-to-form side: box 8f's email is capped at 60 on this "
    "form and box 21's is not."
)
