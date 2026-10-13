"""SF-424's XML mapping against SF424_4_0-V4.0.xsd.

Nineteen response fields do not reach the submission. Eighteen have no rule at all; `fax`
has one keyed `fax_number`, which is not a field this form has, so `Fax` is fed by nothing.
Every element involved is `minOccurs="0"`, so the document validates either way and XSD
checking cannot see any of it.

`tests/src/form_schema/parity/xml/test_conflicts.py` reproduces both kinds through the
API's own transformer.
"""

from ..harness.form_diff import FormDiff
from .shared_conflicts import CIV, EMPTY_EMAIL, MAX_EMAIL

_NO_RULE = "the mapping declares no rule for this field, so {} is never emitted; the XSD makes it optional, so the submission validates without it"

DIFF = FormDiff(
    module="sf424",
    absent_from_definition={
        "applicant_id": _NO_RULE.format("ApplicantID"),
        "revision_type": _NO_RULE.format("RevisionType"),
        "revision_other_specify": _NO_RULE.format("RevisionOtherSpecify"),
        "department_name": _NO_RULE.format("DepartmentName"),
        "division_name": _NO_RULE.format("DivisionName"),
        "federal_entity_identifier": _NO_RULE.format("FederalEntityIdentifier"),
        "federal_award_identifier": _NO_RULE.format("FederalAwardIdentifier"),
        "state_application_id": _NO_RULE.format("StateApplicationID"),
        "state_receive_date": _NO_RULE.format("StateReceiveDate"),
        "organization_affiliation": _NO_RULE.format("OrganizationAffiliation"),
        "authorized_representative_fax": _NO_RULE.format("AuthorizedRepresentativeFax"),
        "contact_person_title": _NO_RULE.format("Title"),
        "contact_person.prefix": _NO_RULE.format("ContactPerson.PrefixName"),
        "contact_person.middle_name": _NO_RULE.format("ContactPerson.MiddleName"),
        "contact_person.suffix": _NO_RULE.format("ContactPerson.SuffixName"),
        "authorized_representative.prefix": _NO_RULE.format("AuthorizedRepresentative.PrefixName"),
        "authorized_representative.middle_name": _NO_RULE.format(
            "AuthorizedRepresentative.MiddleName"
        ),
        "authorized_representative.suffix": _NO_RULE.format("AuthorizedRepresentative.SuffixName"),
        "fax": (
            "the rule that targets Fax is keyed `fax_number`, and this form's field is "
            "`fax`. The rule resolves to nothing, so Fax is never emitted. Note that a "
            "check reading only the XSD side cannot find this one: Fax *is* mapped."
        ),
    },
    differing_rules={
        "Applicant.Country/enum": CIV,
        "Email/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
        "AuthorizedRepresentativeEmail/minLength": EMPTY_EMAIL.format(wire="globLib:EmailDataType"),
        "AuthorizedRepresentativeEmail/maxLength": MAX_EMAIL,
        **{
            f"{element}/{bound}": (
                f"SF424_4_0-V4.0.xsd restricts {element} to {low}..{high}, and the form "
                f"declares no {bound}. An applicant can enter a negative amount, or one "
                f"larger than the element carries, and the submission would be rejected. "
                f"`currency_format` reformats the value; it does not bound it."
            )
            for element, low, high in (
                ("FederalEstimatedFunding", "0.00", "999999999999.99"),
                ("ApplicantEstimatedFunding", "0.00", "999999999999.99"),
                ("StateEstimatedFunding", "0.00", "999999999999.99"),
                ("LocalEstimatedFunding", "0.00", "999999999999.99"),
                ("OtherEstimatedFunding", "0.00", "999999999999.99"),
                ("ProgramIncomeEstimatedFunding", "0.00", "999999999999.99"),
                ("TotalEstimatedFunding", "0.00", "9999999999999.99"),
            )
            for bound in ("minimum", "maximum")
        },
    },
    absent_from_source={
        "fax_number": (
            "no such field on this form -- it is `fax`. The same rename appears in "
            "SF-424 Short's contact groups, where the shared contact question is spelled "
            "`phone_number` upstream and `phone` in the question bank."
        ),
    },
)
