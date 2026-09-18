"""A form's JSON Schema flattened into the inputs an applicant can fill in.

Every path the schema reaches, with the rules that govern what may be submitted for it.
The XSD counterpart is `../xml/flatten_xsd.py`, which produces the same shape over element
names instead, so the two can be compared step for step.
"""

import dataclasses
from typing import Any

from ..paths import ARRAY, Path
from .merge_schema import merge_allof

# Every keyword that can make a payload invalid. Anything else a schema carries -- title,
# description, examples, $comment -- changes what an applicant reads, not what they may
# submit, and is compared by the UI checks rather than here.
VALIDATION_KEYWORDS = frozenset({
    "type",
    "enum",
    "const",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maximum",
    "minimum",
    "exclusiveMaximum",
    "exclusiveMinimum",
    "multipleOf",
    "maxItems",
    "minItems",
    "uniqueItems",
    "maxProperties",
    "minProperties",
    "dependentRequired",
})


@dataclasses.dataclass(frozen=True)
class Input:
    """One input, and every rule that governs what may be submitted for it."""

    required: bool
    rules: tuple[tuple[str, str], ...]

    @property
    def as_dict(self) -> dict[str, str]:
        return dict(self.rules)

    @property
    def json_type(self) -> str | None:
        return self.as_dict.get("type")


def _rules(node: dict[str, Any]) -> tuple[tuple[str, str], ...]:
    """A node's validation keywords, ordered and stringified so two are comparable.

    Values are rendered rather than compared raw because an enum is a list whose order
    carries no meaning, and comparing the lists directly would report a difference where
    there is none.
    """
    import json

    node = dict(node)
    # `const: x` and `enum: [x]` permit exactly one value and reject the same payloads.
    # Simpler Grants writes the enum form because their validator names the keyword that
    # failed and "enum" reads better than "const" in a message, so the two spellings are
    # normalized here rather than reported as a difference.
    if "const" in node:
        node.setdefault("enum", [node.pop("const")])
        node.pop("const", None)

    out = []
    for key in sorted(VALIDATION_KEYWORDS & set(node)):
        value = node[key]
        if isinstance(value, list):
            rendered = json.dumps(sorted(value, key=repr))
        else:
            rendered = json.dumps(value, sort_keys=True)
        out.append((key, rendered))
    return tuple(out)


def inputs(schema: dict[str, Any]) -> dict[Path, Input]:
    """Every input a form has, with the rules that govern it.

    Expects a resolved schema -- every `$ref` already replaced -- because a path can only
    be followed through a schema that has no indirection left in it.
    """
    out: dict[Path, Input] = {}

    def walk(node: dict[str, Any], prefix: Path, required: bool) -> None:
        merged = merge_allof(node)
        if properties := merged.get("properties"):
            demanded = set(merged.get("required", ()))
            for name, sub in properties.items():
                walk(sub, (*prefix, name), name in demanded)
            return
        items = merged.get("items")
        if isinstance(items, dict):
            # An item is required if the list demands a minimum, which is the only sense
            # in which a repeatable section's contents can be mandatory.
            walk(items, (*prefix, ARRAY), bool(merged.get("minItems")))
            return
        if prefix:
            out[prefix] = Input(required=required, rules=_rules(merged))

    walk(schema, (), False)
    return out
