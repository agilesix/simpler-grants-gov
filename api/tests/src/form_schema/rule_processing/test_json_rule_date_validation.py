"""Source-required date ordering through the maintained rule processor."""

import pytest

from src.form_schema.rule_processing.json_rule_processor import process_rule_schema_for_context
from tests.src.form_schema.rule_processing.conftest import setup_context

DATE_RULE = {"gg_validation": {"rule": "date_not_before", "source_field": "start_date"}}


@pytest.mark.parametrize(
    "answers,invalid",
    [
        ({"start_date": "2027-01-02", "end_date": "2027-01-01"}, True),
        ({"start_date": "2027-01-01", "end_date": "2027-01-01"}, False),
        ({"start_date": "2027-01-01", "end_date": "2027-12-31"}, False),
        ({"end_date": "2027-01-01"}, False),
        ({"start_date": "2027-01-01"}, False),
        ({"start_date": "", "end_date": "2027-01-01"}, False),
        ({"start_date": "2027-01-01", "end_date": "2027-02-30"}, False),
        ({"start_date": None, "end_date": "2027-01-01"}, False),
        ({"start_date": 20270102, "end_date": "2027-01-01"}, False),
    ],
)
def test_date_order(answers, invalid, enable_factory_create):
    context = setup_context({"project": answers}, {"project": {"end_date": DATE_RULE}})
    process_rule_schema_for_context(context)
    assert len(context.validation_issues) == int(invalid)
    if invalid:
        issue = context.validation_issues[0]
        assert issue.type == "invalid_date_order"
        assert issue.field == "$.project.end_date"
        assert issue.value == "2027-01-01"
    # The rule validates; it must not reorder, normalize or populate answers.
    assert context.json_data == {"project": answers}


def test_date_order_within_each_repeatable_object(enable_factory_create):
    data = {
        "periods": [
            {"start_date": "2027-01-01", "end_date": "2027-12-31"},
            {"start_date": "2028-01-01", "end_date": "2027-12-31"},
        ]
    }
    context = setup_context(data, {"periods": {"gg_type": "array", "end_date": DATE_RULE}})
    process_rule_schema_for_context(context)
    assert len(context.validation_issues) == 1
    assert context.validation_issues[0].field == "$.periods[1].end_date"


def test_date_validation_can_be_disabled(enable_factory_create):
    context = setup_context(
        {"start_date": "2027-12-31", "end_date": "2027-01-01"},
        {"end_date": DATE_RULE},
        do_field_validation=False,
    )
    process_rule_schema_for_context(context)
    assert context.validation_issues == []
