"""The two reviewer purposes are independent optional whole-text answers."""

from datetime import date

import pytest

from src.form_schema.forms.nsf_suggested_reviewers_generated import FORM
from src.form_schema.jsonschema_validator import validate_json_schema_for_form


@pytest.mark.parametrize(
    "data",
    [
        {},
        {"suggested_reviewers": "x"},
        {"reviewers_not_to_include": "x"},
        {"suggested_reviewers": "x" * 4000, "reviewers_not_to_include": "y" * 4000},
        {
            "suggested_reviewers": "Dr. Élise & <scope>\n第二行",
            "reviewers_not_to_include": "Dr. Ben",
        },
    ],
)
def test_valid_answers(data):
    assert validate_json_schema_for_form(data, FORM) == []


@pytest.mark.parametrize("field", ["suggested_reviewers", "reviewers_not_to_include"])
@pytest.mark.parametrize(
    "value,kind",
    [("", "minLength"), ("x" * 4001, "maxLength"), (None, "type"), (False, "type"), ([], "type")],
)
def test_invalid_answer_is_reported_on_its_own_field(field, value, kind):
    other = "reviewers_not_to_include" if field == "suggested_reviewers" else "suggested_reviewers"
    issues = validate_json_schema_for_form({field: value, other: "Unchanged answer"}, FORM)
    assert len(issues) == 1
    assert issues[0].type == kind
    assert issues[0].field == f"$.{field}"


def test_identity():
    assert FORM.legacy_form_id == 308
    assert FORM.omb_number == "3145-0058"
    assert FORM.expiration_date == date(2026, 11, 30)
    assert FORM.form_renderer == "jsonforms"
