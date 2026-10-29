"""Required strategy, optional named documents and DAT Appendix bounds."""

import uuid
from datetime import date

import pytest

from src.form_schema.forms.phs_398_research_plan_generated import FORM
from src.form_schema.jsonschema_validator import validate_json_schema_for_form

SINGLE_DOCUMENTS = (
    "introduction_to_application",
    "specific_aims",
    "research_strategy",
    "progress_report_publication_list",
    "vertebrate_animals",
    "select_agent_research",
    "multiple_pd_pi_leadership_plan",
    "consortium_contractual_arrangements",
    "letters_of_support",
    "resource_sharing_plans",
    "other_plans",
    "authentication_of_key_biological_and_or_chemical_resources",
)
FILE_ID = "83cd24d4-e319-4c61-982c-b216299f5eb4"


@pytest.mark.parametrize("field", SINGLE_DOCUMENTS)
def test_named_document_uuid(field):
    data = {"research_strategy": FILE_ID, field: FILE_ID}
    assert validate_json_schema_for_form(data, FORM) == []
    data[field] = "not-a-file-id"
    issues = validate_json_schema_for_form(data, FORM)
    assert len(issues) == 1
    assert issues[0].type == "format"
    assert issues[0].field == f"$.{field}"


def test_strategy_is_required():
    issues = validate_json_schema_for_form({}, FORM)
    assert len(issues) == 1
    assert issues[0].type == "required"
    assert issues[0].field == "$.research_strategy"


@pytest.mark.parametrize("count", [0, 1, 10])
def test_appendix_valid_counts(count):
    data = {"research_strategy": FILE_ID, "appendix": [str(uuid.uuid4()) for _ in range(count)]}
    assert validate_json_schema_for_form(data, FORM) == []


def test_appendix_over_dat_limit():
    issues = validate_json_schema_for_form(
        {"research_strategy": FILE_ID, "appendix": [FILE_ID] * 11}, FORM
    )
    assert len(issues) == 1
    assert issues[0].type == "maxItems"


def test_identity():
    assert FORM.legacy_form_id == 797
    assert FORM.omb_number == "0925-0001"
    assert FORM.expiration_date == date(2027, 12, 31)
