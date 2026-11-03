"""Mandatory draft constraints and population use the shared schema/rule services."""

from copy import deepcopy

import pytest

from src.form_schema.forms.sf424_mandatory_generated import FORM, FORM_JSON_SCHEMA, FORM_RULE_SCHEMA
from src.form_schema.jsonschema_validator import validate_json_schema_for_form
from src.form_schema.rule_processing.json_rule_processor import process_rule_schema_for_context
from tests.src.form_schema.rule_processing.conftest import setup_context


@pytest.mark.parametrize("index", [0, 1])
def test_examples_and_unsigned_drafts(index):
    data = deepcopy(FORM_JSON_SCHEMA["examples"][index])
    assert validate_json_schema_for_form(data, FORM) == []
    data.pop("dates", None)
    data["authorized_representative"].pop("signature", None)
    data["authorized_representative"].pop("date_signed", None)
    assert validate_json_schema_for_form(data, FORM) == []


@pytest.mark.parametrize(
    "path",
    [
        "submission.type_other_description",
        "submission.frequency_other_description",
        "submission.consolidated_request_explanation",
        "applicant.type.other_specify",
        "state_review.available_date",
        "debt.explanation",
    ],
)
@pytest.mark.parametrize("value", [None, ""])
def test_all_six_conditional_questions_require_an_answer(path, value):
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    parent, key = path.split(".")[0:-1], path.split(".")[-1]
    target = data
    for part in parent:
        target = target[part]
    if value is None:
        del target[key]
    else:
        target[key] = value
    assert validate_json_schema_for_form(data, FORM)


@pytest.mark.parametrize(
    ("path", "value"),
    [
        ("project.title", "x" * 251),
        ("applicant.department", "x" * 31),
        ("applicant.division", "x" * 31),
        ("applicant.ein", "12345678"),
        ("applicant.type.code", "Z: Unknown"),
        ("certification.agree", False),
        ("funding.estimated_federal", -0.01),
        ("funding.estimated_federal", 0.001),
        ("funding.estimated_federal", 1000000000000),
        ("funding.start_date", "invalid-date"),
        ("attachments", [f"00000000-0000-4000-8000-{i:012d}" for i in range(101)]),
    ],
)
def test_source_boundaries(path, value):
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    keys = path.split(".")
    target = data
    for key in keys[:-1]:
        target = target[key]
    target[keys[-1]] = value
    assert validate_json_schema_for_form(data, FORM)


def test_population_uses_existing_context_and_submission_providers(enable_factory_create):
    original = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Application")
    )
    original["opportunity"]["agency_name"] = "Untrusted agency"
    context = setup_context(
        original,
        FORM_RULE_SCHEMA,
        do_post_population=False,
        do_field_validation=False,
        has_organization=True,
        uei="AUTHORITY001",
        agency_name="Synthetic Agency",
        assistance_listing_number="84.027",
        assistance_listing_program_title="Synthetic Program",
        user_email="signer@example.org",
    )
    process_rule_schema_for_context(context)
    assert context.json_data["opportunity"] == {
        "agency_name": "Synthetic Agency",
        "assistance_listing": {"number": "84.027", "title": "Synthetic Program"},
    }
    assert context.json_data["applicant"]["uei"] == "AUTHORITY001"
    assert "dates" not in context.json_data
    assert "signature" not in context.json_data["authorized_representative"]
    assert context.application_form.application_response == original
    context.config.do_post_population = True
    process_rule_schema_for_context(context)
    assert (
        context.json_data["dates"]["received_date"]
        == context.json_data["authorized_representative"]["date_signed"]
    )
    assert context.json_data["authorized_representative"]["signature"] == "signer@example.org"
    assert validate_json_schema_for_form(context.json_data, FORM) == []


@pytest.mark.parametrize("owned", [True, False])
def test_existing_attachment_rules_check_both_shapes(enable_factory_create, owned):
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    ids = [*data["attachments"], data["congressional_districts"]["additional_attachment"]]
    context = setup_context(
        data,
        FORM_RULE_SCHEMA,
        do_pre_population=False,
        do_post_population=False,
        attachment_ids=ids if owned else [],
    )
    process_rule_schema_for_context(context)
    assert context.attachment_ids == set(ids)
    issues = [v for v in context.validation_issues if v.type == "unknown_application_attachment"]
    assert len(issues) == (0 if owned else 3)
    if not owned:
        assert {v.field for v in issues} == {
            "$.congressional_districts.additional_attachment",
            "$.attachments[0]",
            "$.attachments[1]",
        }
