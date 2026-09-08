"""Flattening `allOf`, and refusing to guess when it cannot be done exactly.

A validator never needs this. `allOf` is a conjunction, so it applies every branch and the
effective constraint is whatever survives all of them -- with a payload in hand, nothing
has to be decided. Flattening has no payload, so it has to produce one schema correct for
every possible input, and that is where the ambiguity lives.

Two branches declaring `maxLength` 60 and 200 validate as 60. A flattener that picks 200
accepts values the original rejected, silently. Rather than implement precedence and hope
it matches, this raises: the merge is exact for every schema it accepts and refuses the
rest. Across SF-424 and SF-424A there is nothing to refuse -- no keyword is declared twice
-- so the exactness is not theoretical.

Conditional branches are left where they are. `if`/`then` cannot be flattened at all,
because which branch applies depends on the payload.
"""

from typing import Any

CONDITIONAL = frozenset({"if", "then", "else"})

# Keywords whose values combine rather than collide, so seeing them twice is not ambiguous.
COMBINING = frozenset({"properties", "required", "allOf", "$defs", "definitions"})

# Keywords that describe rather than constrain. They cannot make a payload invalid, so two
# values are not a contradiction -- a form overriding a shared question's label is the
# ordinary case, and the form's own wins, which is what the renderer shows.
ANNOTATION = frozenset({
    "title",
    "description",
    "examples",
    "default",
    "$comment",
    "deprecated",
    "readOnly",
    "writeOnly",
})


class AmbiguousComposition(Exception):
    """Two branches declare the same keyword, and choosing between them would be a guess."""


def _is_conditional(branch: Any) -> bool:
    return isinstance(branch, dict) and bool(CONDITIONAL & set(branch))


def merge_allof(schema: Any, path: str = "") -> Any:
    """A schema with its composable `allOf` branches folded in, recursively.

    Raises `AmbiguousComposition` if two branches, or a branch and the node itself, declare
    the same constraining keyword with different values.
    """
    if isinstance(schema, list):
        return [merge_allof(item, path) for item in schema]
    if not isinstance(schema, dict):
        return schema

    merged: dict[str, Any] = {}
    for key, value in schema.items():
        if key == "allOf":
            continue
        merged[key] = merge_allof(value, f"{path}.{key}" if path else key)

    branches = schema.get("allOf")
    if not isinstance(branches, list):
        return merged

    conditional = [b for b in branches if _is_conditional(b)]
    for branch in (b for b in branches if not _is_conditional(b)):
        folded = merge_allof(branch, path)
        if not isinstance(folded, dict):
            continue
        for key, value in folded.items():
            if key not in merged:
                merged[key] = value
            elif key == "properties":
                # Per property, not per properties-object: a form adding a description to
                # one member of a composed question must not replace that member.
                for name, sub in value.items():
                    merged[key][name] = (
                        merge_allof({"allOf": [sub, merged[key][name]]}, f"{path}.{name}")
                        if name in merged[key]
                        else sub
                    )
            elif key == "required":
                merged[key] = sorted({*merged[key], *value})
            elif key in ANNOTATION:
                pass  # the node's own already sits in `merged`, and it wins
            elif key in COMBINING:
                merged[key] = {**value, **merged[key]}
            elif merged[key] != value:
                raise AmbiguousComposition(
                    f"{path or '<root>'}: `{key}` is declared as {merged[key]!r} and {value!r}. "
                    "Flattening would have to choose, and choosing wrong changes what is valid. "
                    "The validator does not choose -- it applies both."
                )

    if conditional:
        merged["allOf"] = conditional
    return merged
