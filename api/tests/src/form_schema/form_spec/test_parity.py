"""Whether a SimplerForms form is equivalent to the hand-written form it mirrors.

Three checks against the mapping in `parity/mappings/`: every entry names a field both
forms have, every input on both sides appears in the mapping, and corresponding inputs are
governed by the same rules.

The second is the only one that can see a field one form has and the other lacks -- neither
schema sets `additionalProperties`, so an unexpected field validates cleanly on both.

The third is a summary: it reads a flattened schema, and flattening is an approximation the
validator never makes. A property-based counterpart is parked on
`widal001/parity-property-tests`; it is not here because it never found a difference these
checks missed, and its generated values are over every limit rather than between two of
them, so it cannot see two forms declaring different limits.
"""

import importlib

import pytest

from src.form_schema.jsonschema_resolver import resolve_jsonschema
from tests.src.form_schema.form_spec.parity import mapping as checks
from tests.src.form_schema.form_spec.parity import paths
from tests.src.form_schema.form_spec.parity.mappings import (
    key_contacts,
    sf424,
    sf424_short,
    sf424a,
)

MAPPINGS = [
    sf424.MAPPING,
    sf424_short.MAPPING,
    sf424a.MAPPING,
    key_contacts.MAPPING,
]


def _schemas(m):
    generated = importlib.import_module(f"src.form_schema.forms.{m.generated_module}")
    handwritten = importlib.import_module(f"src.form_schema.forms.{m.handwritten_module}")
    return (
        resolve_jsonschema(generated.FORM.form_json_schema),
        resolve_jsonschema(handwritten.FORM_JSON_SCHEMA),
    )


@pytest.fixture(scope="module", params=MAPPINGS, ids=lambda m: m.generated_module)
def pair(request):
    """A form pair: the mapping, both resolved schemas, and both sides' inputs."""
    m = request.param
    generated_schema, handwritten_schema = _schemas(m)
    return (
        m,
        generated_schema,
        handwritten_schema,
        paths.inputs(generated_schema),
        paths.inputs(handwritten_schema),
    )


# --- structure -------------------------------------------------------------


class TestStructuralParity:
    """Does the mapping account for both forms, and do corresponding fields agree?"""

    def test_mapping_names_only_real_inputs(self, pair):
        """An entry naming a field neither form has makes the rest of the mapping meaningless."""
        m, _, _, generated, handwritten = pair
        stale = checks.stale_entries(m, generated, handwritten)
        assert not stale, "mapping entries do not correspond to real inputs:\n" + "\n".join(
            f"  {d}" for d in stale
        )

    def test_every_input_appears_in_the_mapping(self, pair):
        """A field on either side the mapping does not account for."""
        m, _, _, generated, handwritten = pair
        missing = checks.unmapped(m, generated, handwritten)
        assert not missing, "inputs are unaccounted for:\n" + "\n".join(f"  {d}" for d in missing)

    def test_corresponding_inputs_are_governed_by_the_same_rules(self, pair):
        """Every rule that can make a payload invalid, plus requiredness."""
        m, _, _, generated, handwritten = pair
        conflicts = checks.rule_conflicts(m, generated, handwritten)
        assert not conflicts, "corresponding inputs are governed by different rules:\n" + "\n".join(
            f"  {d}" for d in conflicts
        )
