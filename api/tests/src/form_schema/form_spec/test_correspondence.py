"""Does the mapping pair up the fields it claims to?

`test_parity.py` reads real forms, where almost everything lines up. This exercises the
pairing rule against made-up inputs so each case is visible on its own: matching paths
correspond, a declared rename overrides that, and anything left over must be declared
absent.
"""

import pytest

from tests.src.form_schema.form_spec.parity.mapping import (
    FormMapping,
    pairs,
    stale_entries,
    unmapped,
)
from tests.src.form_schema.form_spec.parity.paths import Input

NOTHING_DECLARED = FormMapping(generated_module="g", handwritten_module="h")


def inputs(*names: str) -> dict[tuple[str, ...], Input]:
    return {tuple(name.split(".")): Input(required=False, rules=()) for name in names}


def rendered(mapping, generated, handwritten) -> dict[str, str]:
    return {".".join(k): ".".join(v) for k, v in pairs(mapping, generated, handwritten).items()}


def test_matching_paths_correspond_without_being_declared():
    both = inputs("agency_name", "applicant.street1")
    assert rendered(NOTHING_DECLARED, both, both) == {
        "agency_name": "agency_name",
        "applicant.street1": "applicant.street1",
    }
    assert not unmapped(NOTHING_DECLARED, both, both)


@pytest.mark.parametrize(
    ("generated", "handwritten", "expected"),
    [
        (inputs("a", "extra"), inputs("a"), "generated input is unmapped: extra"),
        (inputs("a"), inputs("a", "legacy"), "handwritten input is unmapped: legacy"),
    ],
)
def test_a_field_only_one_form_has_must_be_declared(generated, handwritten, expected):
    """The check the identity default must not weaken."""
    assert [str(d) for d in unmapped(NOTHING_DECLARED, generated, handwritten)] == [expected]


def test_declaring_a_field_absent_accounts_for_it():
    declared = FormMapping(
        generated_module="g",
        handwritten_module="h",
        absent_from_handwritten={"extra": "the specification asks for it and the form does not"},
    )
    assert not unmapped(declared, inputs("a", "extra"), inputs("a"))


def test_a_rename_pairs_two_different_names():
    renamed = FormMapping(
        generated_module="g", handwritten_module="h", renamed={"p.phone": "p.phone_number"}
    )
    generated, handwritten = inputs("p.phone"), inputs("p.phone_number")
    assert rendered(renamed, generated, handwritten) == {"p.phone": "p.phone_number"}
    assert not unmapped(renamed, generated, handwritten)


def test_a_rename_must_name_a_field_that_exists():
    renamed = FormMapping(
        generated_module="g", handwritten_module="h", renamed={"p.phone": "p.phone_number"}
    )
    assert [str(d) for d in stale_entries(renamed, inputs("p.phone"), inputs("p.other"))] == [
        "no such handwritten input: p.phone_number"
    ]


def test_a_rename_to_the_same_path_is_rejected():
    """A redundant entry would imply a difference that is not there."""
    pointless = FormMapping(generated_module="g", handwritten_module="h", renamed={"a": "a"})
    both = inputs("a")
    assert [d.kind for d in stale_entries(pointless, both, both)] == ["rename to the same path"]


def test_an_ambiguous_rename_is_left_unaccounted_for_rather_than_guessed():
    """Both forms have `a` and `b` and the mapping renames `a` to `b`. Pairing `b` to
    itself as well would map it two ways, so neither end is paired and the ambiguity has
    to be declared."""
    ambiguous = FormMapping(generated_module="g", handwritten_module="h", renamed={"a": "b"})
    both = inputs("a", "b")
    assert rendered(ambiguous, both, both) == {"a": "b"}
    assert [str(d) for d in unmapped(ambiguous, both, both)] == [
        "generated input is unmapped: b",
        "handwritten input is unmapped: a",
    ]
