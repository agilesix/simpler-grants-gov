"""Whether the checks both sides share behave the way each side's tests assume.

`compare.py` at this level reads a `FormDiff` and nothing else, so it is exercised here
rather than twice over. One class per function under test.
"""

import dataclasses

import pytest

from tests.src.form_schema.parity import compare, form_diff
from tests.src.form_schema.parity.form_diff import FormDiff

A_REAL_CITATION = "globLib:EmailDataType caps at maxLength 60 and the form declares none"


@dataclasses.dataclass(frozen=True, kw_only=True)
class SideWithExtras(FormDiff):
    """A side's record, with each kind of field a side is allowed to add."""

    module: str = "a_form"
    unreadable: dict[str, str] = dataclasses.field(
        default_factory=dict, metadata=form_diff.REGISTER
    )
    renamed: dict[str, str] = dataclasses.field(default_factory=dict)


class TestRegisters:
    """Which of a record's fields `registers()` finds, whatever side declared them."""

    def test_finds_every_register_the_base_declares(self):
        found = dict(compare.registers(FormDiff()))
        assert set(found) == {
            "absent_from_source",
            "absent_from_definition",
            "differing_rules",
        }

    def test_finds_registers_a_side_adds_of_its_own(self):
        """Read off the dataclass, so a new side's register is covered without being listed."""
        assert "unreadable" in dict(compare.registers(SideWithExtras()))

    def test_ignores_a_dictionary_that_is_not_a_register(self):
        """`renamed` maps one path to another. Its values are paths, not reasons, and
        holding them to a reason's standard reported every rename as unjustified."""
        assert "renamed" not in dict(compare.registers(SideWithExtras()))

    def test_ignores_fields_that_are_not_dictionaries(self):
        """A record names the module it reads; that is not an entry to be justified."""
        assert "module" not in dict(compare.registers(SideWithExtras()))


class TestUsableReasons:
    """Which entries `usable_reasons()` reports as giving a reason nobody could act on."""

    def test_accepts_a_reason_that_cites_something(self):
        diff = FormDiff(absent_from_source={"a_field": A_REAL_CITATION})
        assert not compare.usable_reasons(diff)

    def test_flags_a_reason_too_short_to_be_one(self):
        diff = FormDiff(absent_from_source={"a_field": "too short"})
        assert [d.kind for d in compare.usable_reasons(diff)] == ["unusable reason"]

    @pytest.mark.parametrize(
        "reason",
        [
            "a reason long enough to clear the length bar but carrying {wire} unfilled",
            "a reason long enough to clear the length bar but carrying repr(x) by mistake",
        ],
        ids=["unfilled-placeholder", "leftover-repr"],
    )
    def test_flags_a_reason_left_as_a_template(self, reason):
        """A docstring edit once replaced two citations with the text of the script meant to
        write them. Nothing read the reasons, so it went unnoticed."""
        diff = FormDiff(absent_from_source={"a_field": reason})
        assert [d.kind for d in compare.usable_reasons(diff)] == ["unusable reason"]

    def test_checks_every_register_not_just_the_first(self):
        diff = FormDiff(
            absent_from_source={"a_field": A_REAL_CITATION},
            differing_rules={"a_field/maxLength": "too short"},
        )
        assert [d.path for d in compare.usable_reasons(diff)] == [
            "differing_rules['a_field/maxLength']"
        ]
