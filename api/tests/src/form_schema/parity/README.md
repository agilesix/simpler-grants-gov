# Form parity

Whether a form generated from a SimplerForms specification is equivalent to the
hand-written form it mirrors.

## Running them

```bash
# Four forms in about a tenth of a second, so this belongs on every commit.
make test args="tests/src/form_schema/parity"

# One form, when a failure needs chasing.
make test args="tests/src/form_schema/parity -k sf424_short_portable"
```

Running natively rather than in the container is much faster, and needs the environment
`make init` writes to `override.env`, which pytest does not read on its own:

```bash
export PY_RUN_APPROACH=local
set -a && . override.env && set +a
export DB_HOST=localhost SEARCH_ENDPOINT=localhost
uv run pytest tests/src/form_schema/parity
```

## What is checked

From the hand-written record in `diffs/`:

- every mapping entry names a field both forms actually have
- every input on both sides appears in the mapping
- corresponding inputs are governed by the same validation rules

The second is the only check that can see a field one form has and the other lacks.
Neither schema sets `additionalProperties`, so an unexpected field validates cleanly on
both. Parity therefore cannot be established by running payloads through a validator.

The third reads a flattened schema, which is an approximation a validator never has to
make. In exchange it names every field and keyword that differs in one pass, where a
validator needs a payload that exercises each one.

## The property-based check, and why it is not here

A counterpart would generate payloads and require the API's own validator to reach the
same verdict against both schemas. It is not here for two reasons.

It finds nothing the rule comparison does not -- every recorded difference came from the
rule comparison. And it misses the most common kind: generated values land over *every*
limit rather than between two, so a field capped at 60 on one side and 200 on the other
rejects them on both and the difference stays invisible. Catching that needs values drawn
from each field's declared facets.

## Adding a form

A form contributes a mapping and nothing else -- no test code, no fixture, no seed. Write
`diffs/<form>.py` naming the two modules and the paths that correspond, add it to
`DIFFS` in `test_forms.py`, and it inherits every check. The mapping is deliberately
hand-written: it is a claim about two forms that someone should have to defend, and the
checks then hold it to both schemas so it cannot be quietly tuned until they pass.

## When a check fails

A rule difference where the official Grants.gov schema shows the *hand-written* form is
the one that is wrong goes in `upstream_rule_defects`, with a citation naming the XSD, the
type and the facet. That is a defect list for Simpler Grants, not permission for the
difference to exist -- and `stale_entries` fails if an entry stops naming a real input, so
the register cannot rot.

Anything else is ours to fix.

## The XML mapping checks

`xml/test_forms.py` asks a different question of the same forms -- whether each one's
`json_to_xml_schema` agrees with the Grants.gov XSD it targets. Its module docstring
explains what it compares.
