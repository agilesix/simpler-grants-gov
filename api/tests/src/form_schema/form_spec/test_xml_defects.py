"""Reproduces the defects `test_xml_mapping.py` finds, using Simpler Grants' own harness.

Every test here takes a fixture that already exists in
`tests/src/services/xml_generation/`, adds the values the mapping checks flagged, and runs
it through the same `XMLGenerationService` and `XSDValidator` calls their XSD tests use.
Nothing is reimplemented, so a failure cannot be blamed on a parallel code path.

These tests pass while the defects exist. Fixing one turns its test red, which is the
signal to retire the reproduction along with the entry in `xml/mappings/`.

The point is what the fixtures do not contain. Their suite is green because its fixtures
answer the fields whose rules work and choose the enum members the schema accepts. Add the
other values and the same harness reports two kinds of defect:

- answers that vanish from a submission the schema still calls valid
- answers the form accepts that make the submission invalid
"""

import pytest

from src.form_schema.forms import init_form_registry
from src.form_schema.forms.sf424 import FORM_JSON_SCHEMA as SF424_SCHEMA
from src.form_schema.forms.sf424_portable import FORM as GENERATED
from src.form_schema.jsonschema_resolver import resolve_jsonschema
from src.form_schema.jsonschema_validator import validate_json_schema
from src.services.xml_generation.config import _build_xml_form_map
from src.services.xml_generation.models import XMLGenerationRequest
from src.services.xml_generation.service import XMLGenerationService
from src.services.xml_generation.validation.xsd_validator import XSDValidator
from tests.src.form_schema.form_spec.xml.mappings import sf424 as sf424_record
from tests.src.services.xml_generation.test_sf424_short_xml_generation import (
    _SNAPSHOT_DATA as SHORT_FIXTURE,
)
from tests.src.services.xml_generation.test_xml_validation_cases import (
    DEFECTIVE_APPLICATIONS,
)
from tests.src.services.xml_generation.test_xml_validation_cases import (
    VALID_APPLICATION as SF424_FIXTURE,
)
from tests.src.services.xml_generation.test_xml_validation_cases import XSD_DIR

# The form offers the straight apostrophe, U+0027. UniversalCodes-V2.0.xsd declares the
# typographic one, U+2019. Nothing else about the two strings differs, which is why it
# survives review.
FORM_IVOIRE = "CIV: CÔTE D'IVOIRE"
SCHEMA_IVOIRE = "CIV: CÔTE D’IVOIRE"

#: An answer for each SF-424 field the mapping reaches no element for. Distinctive so its
#: absence from the submission can be asserted by looking for it.
ANSWERS_TO_DROPPED_FIELDS = {
    "applicant_id": "APPLICANT-ID-0001",
    "revision_type": "A: Increase Award",
    "revision_other_specify": "REVISION-OTHER-0001",
    "department_name": "DEPARTMENT-NAME-0001",
    "division_name": "DIVISION-NAME-0001",
    "federal_entity_identifier": "FEDERAL-ENTITY-0001",
    "federal_award_identifier": "FEDERAL-AWARD-0001",
    "state_application_id": "STATE-APPLICATION-0001",
    "state_receive_date": "2026-02-03",
    "organization_affiliation": "ORGANIZATION-AFFILIATION-0001",
    "authorized_representative_fax": "555-0111",
    "contact_person_title": "CONTACT-PERSON-TITLE-0001",
    "fax": "555-0222",
    "contact_person": {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "prefix": "PREFIX-01",
        "middle_name": "MIDDLE-NAME-0001",
        "suffix": "SUFFIX-01",
    },
    "authorized_representative": {
        "first_name": "John",
        "last_name": "Doe",
        "prefix": "AORPRFX-01",
        "middle_name": "AOR-MIDDLE-NAME-0001",
        "suffix": "AORSFX-01",
    },
}


@pytest.fixture(scope="module", autouse=True)
def registry() -> None:
    """`_build_xml_form_map` reads the form registry, as their own fixtures do first."""
    init_form_registry()


@pytest.fixture(scope="module")
def validator() -> XSDValidator:
    return XSDValidator(XSD_DIR)


def submission(form: str, data: dict) -> str:
    """The XML their service generates for a response, by the call their tests make."""
    result = XMLGenerationService().generate_xml(
        XMLGenerationRequest(
            transform_config=_build_xml_form_map()[form],
            application_data=data,
            pretty_print=True,
        )
    )
    assert result.success, result.error_message
    return result.xml_data


def sf424(**extra) -> dict:
    return {**SF424_FIXTURE, **extra}


def short(**extra) -> dict:
    return {**SHORT_FIXTURE, **extra}


def rejections(data: dict) -> set[tuple[str, str]]:
    """What the API's own validator objects to in a response."""
    schema = resolve_jsonschema(SF424_SCHEMA)
    return {(str(issue.field), issue.message) for issue in validate_json_schema(data, schema)}


class TestDefectiveFixtureValidity:
    """Whether the form stores the values the defect cases rely on."""

    @pytest.mark.parametrize(
        "defective",
        [param.values[0] for param in DEFECTIVE_APPLICATIONS],
        ids=[param.id for param in DEFECTIVE_APPLICATIONS],
    )
    def test_every_defective_fixture_is_one_the_form_accepts(self, defective):
        """The premise of all of this: an applicant could actually submit these values.

        A value the form's own validator rejects can never reach `application_response`, so a
        schema that will not carry it is a curiosity rather than a defect. Asserting this
        caught two mistakes: an empty email, which `format: email` rejects, and prefix and
        suffix answers longer than the form's ten characters.
        """
        assert not rejections(defective) - rejections(SF424_FIXTURE)

    def test_the_answers_to_the_dropped_fields_are_ones_the_form_accepts(self):
        assert not rejections(sf424(**ANSWERS_TO_DROPPED_FIELDS)) - rejections(SF424_FIXTURE)

    def test_their_fixtures_still_validate(self, validator):
        """The baseline their suite asserts. Everything below is one fixture change away."""
        assert validator.validate_xml_for_form(
            submission("SF424_4_0", SF424_FIXTURE), "SF424_4_0-V4.0"
        )["valid"]
        assert validator.validate_xml_for_form(
            submission("SF424_SHORT_3_0", SHORT_FIXTURE), "SF424_Short_3_0-V3.0"
        )["valid"]


# --- answers that vanish from a valid submission ---------------------------


def answered(field: str) -> str:
    """What the fixture answers `field` with, so its absence can be looked for."""
    node = sf424(**ANSWERS_TO_DROPPED_FIELDS)
    for step in field.split("."):
        assert step in node, f"the fixture does not answer {field}"
        node = node[step]
    return node


class TestDroppedResponseFields:
    """Response fields absent from a submission the XSD still accepts."""

    def test_nineteen_sf424_answers_do_not_reach_the_submission(self):
        """Every field `xml/mappings/sf424.py` records is answered here, and none is in the XML."""
        xml = submission("SF424_4_0", sf424(**ANSWERS_TO_DROPPED_FIELDS))

        recorded = sorted(sf424_record.MAPPING.dropped)
        assert len(recorded) == 19

        reached = sorted(field for field in recorded if answered(field) in xml)
        assert not reached, f"expected these to be dropped, and they were submitted: {reached}"

    def test_the_submission_that_drops_them_is_still_valid(self, validator):
        """Which is why no XSD check, snapshot or fixture has caught any of this."""
        result = validator.validate_xml_for_form(
            submission("SF424_4_0", sf424(**ANSWERS_TO_DROPPED_FIELDS)), "SF424_4_0-V4.0"
        )
        assert result["valid"], result["error_message"]

    def test_a_fax_number_is_dropped_because_the_rule_reads_a_field_that_does_not_exist(self):
        """`Fax` is mapped -- from `fax_number`. SF-424's field is `fax`."""
        assert "Fax>" not in submission("SF424_4_0", sf424(fax="555-0222"))
        assert "<SF424_4_0:Fax>555-0222</SF424_4_0:Fax>" in submission(
            "SF424_4_0", sf424(fax_number="555-0222")
        )


# --- answers the form accepts that the schema rejects ----------------------


class TestXsdRejectedValues:
    """Values the form stores that make the submission fail XSD validation."""

    def test_the_country_the_form_offers_is_not_the_one_the_schema_declares(self, validator):
        """One character apart, and the submission is rejected."""
        chosen = {**SF424_FIXTURE["applicant"], "country": FORM_IVOIRE}
        result = validator.validate_xml_for_form(
            submission("SF424_4_0", sf424(applicant=chosen)), "SF424_4_0-V4.0"
        )
        assert not result["valid"]
        assert "XsdEnumerationFacets" in result["error_message"]

    @pytest.mark.parametrize(
        ("amount", "facet", "why"),
        [
            ("-1000.00", "XsdMinInclusiveFacet", "the form's pattern permits a leading minus"),
            (
                "99999999999999",
                "XsdMaxInclusiveFacet",
                "the form caps the length at 14 rather than the value at 999999999999.99",
            ),
        ],
    )
    def test_a_funding_amount_the_form_accepts_cannot_be_submitted(
        self, validator, amount, facet, why
    ):
        result = validator.validate_xml_for_form(
            submission("SF424_4_0", sf424(federal_estimated_funding=amount)), "SF424_4_0-V4.0"
        )
        assert not result["valid"], f"{amount} was accepted -- {why}"
        assert facet in result["error_message"]

    def test_a_state_and_a_province_together_cannot_be_submitted(self, validator):
        """globLib:AddressDataTypeV3 models them as an `xs:choice`; the form holds both."""
        both = {**SHORT_FIXTURE["applicant"], "province": "Ontario"}
        result = validator.validate_xml_for_form(
            submission("SF424_SHORT_3_0", short(applicant=both)), "SF424_Short_3_0-V3.0"
        )
        assert not result["valid"]
        assert "Province" in result["error_message"]
        assert "model='sequence'" in result["error_message"]


# --- what the generated form does with the same values ---------------------


def generated(**overrides) -> dict:
    """The generated SF-424's own verdict on a response."""
    schema = resolve_jsonschema(GENERATED.form_json_schema)
    data = sf424(**overrides)
    return {(str(i.field), i.message) for i in validate_json_schema(data, schema)} - {
        (str(i.field), i.message) for i in validate_json_schema(SF424_FIXTURE, schema)
    }


# Their parameters carry `xfail(strict=True)` marks, which describe what *their* check does
# with each fixture. Reusing the marks here would invert the meaning, so only the data and
# the label are borrowed.
#
# State and Province together is left out deliberately: globLib:AddressDataTypeV3 models
# them as an xs:choice, the address question is shared by thirteen forms, and deciding which
# of a state and a province wins is a content question rather than a porting one.
REJECTABLE = [
    pytest.param(param.values[0], id=param.id)
    for param in DEFECTIVE_APPLICATIONS
    if "state-and-province" not in param.id
]


class TestGeneratedFormXmlMapping:
    """The same fixtures against the form compiled from the specification."""

    def test_the_generated_mapping_carries_the_answers_the_handwritten_one_drops(self, validator):
        """Same fixture, same transformer, a mapping written to the schema instead of copied."""
        data = sf424(**ANSWERS_TO_DROPPED_FIELDS)
        result = XMLGenerationService().generate_xml(
            XMLGenerationRequest(
                transform_config=GENERATED.json_to_xml_schema,
                application_data=data,
                pretty_print=True,
            )
        )
        assert result.success, result.error_message

        xml = result.xml_data
        missing = sorted(
            field for field in sf424_record.MAPPING.dropped if answered(field) not in xml
        )
        assert not missing, f"the generated mapping also drops: {missing}"

        assert validator.validate_xml_for_form(xml, "SF424_4_0-V4.0")["valid"]

    @pytest.mark.parametrize("defective", REJECTABLE)
    def test_the_generated_form_rejects_what_the_handwritten_one_accepts(self, defective):
        """The value never reaches XML generation, because the form will not store it.

        Each of these is a fixture the hand-written form accepts and SF424_4_0-V4.0.xsd
        rejects -- the xfail cases in test_xml_validation_cases.py. The generated form declares
        what the schema declares, so the answer is refused at the form instead of at Grants.gov.
        """
        changed = {
            field: value for field, value in defective.items() if SF424_FIXTURE.get(field) != value
        }
        assert generated(**changed), f"the generated form also accepts {sorted(changed)}"
