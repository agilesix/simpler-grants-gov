"""Individual draft validation and existing population-service ownership."""

from copy import deepcopy

import pytest

from src.form_schema.forms.sf424_individual_generated import (
    FORM,
    FORM_JSON_SCHEMA,
    FORM_RULE_SCHEMA,
)
from src.form_schema.jsonschema_validator import validate_json_schema_for_form
from src.form_schema.rule_processing.json_rule_processor import process_rule_schema_for_context
from tests.src.form_schema.rule_processing.conftest import setup_context


def draft(index=0):
    data = deepcopy(FORM_JSON_SCHEMA["examples"][index])
    data.pop("date_received", None)
    data["certification"].pop("signature", None)
    data["certification"].pop("date_signed", None)
    return data


@pytest.mark.parametrize("index", [0, 1])
def test_unsigned_draft_and_complete_sample(index):
    assert validate_json_schema_for_form(draft(index), FORM) == []
    assert validate_json_schema_for_form(FORM_JSON_SCHEMA["examples"][index], FORM) == []


@pytest.mark.parametrize(
    "change",
    ["missing_citizenship", "missing_residency", "uncertified", "long_title", "invalid_date"],
)
def test_invalid_answer_boundaries(change):
    data = draft()
    if change == "missing_citizenship":
        data["applicant"]["citizenship"] = {}
    elif change == "missing_residency":
        data["applicant"]["citizenship"] = {"is_us_citizen": False}
    elif change == "uncertified":
        data["certification"]["agree"] = False
    elif change == "long_title":
        data["project"]["title"] = "x" * 201
    else:
        data["project"]["start_date"] = "not-a-date"
    assert validate_json_schema_for_form(data, FORM)


def test_population_phases_use_existing_providers(enable_factory_create):
    original = draft()
    original["opportunity"]["agency_name"] = "Untrusted agency"
    context = setup_context(
        original,
        FORM_RULE_SCHEMA,
        do_post_population=False,
        opportunity_number="SYNTHETIC-INDIVIDUAL",
        opportunity_title="Synthetic Individual Fellowship",
        agency_name="Synthetic Agency",
        assistance_listing_number="45.160",
        assistance_listing_program_title="Synthetic Program",
        user_email="synthetic@example.org",
    )
    process_rule_schema_for_context(context)
    assert context.json_data["opportunity"] == {
        "agency_name": "Synthetic Agency",
        "number": "SYNTHETIC-INDIVIDUAL",
        "title": "Synthetic Individual Fellowship",
        "assistance_listing": {"number": "45.160", "title": "Synthetic Program"},
    }
    assert "date_received" not in context.json_data
    assert "signature" not in context.json_data["certification"]
    assert context.application_form.application_response == original
    context.config.do_post_population = True
    process_rule_schema_for_context(context)
    assert context.json_data["date_received"] == context.json_data["certification"]["date_signed"]
    assert context.json_data["certification"]["signature"] == "synthetic@example.org"
    assert validate_json_schema_for_form(context.json_data, FORM) == []
