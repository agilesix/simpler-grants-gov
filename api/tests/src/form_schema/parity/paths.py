"""How both sides address the things they compare.

A path is a tuple of steps, rendered as a dotted string for humans. `[]` is one step,
standing for every item of a repeatable section: a form declares one shape for the items,
so one path describes them all.

The steps mean different things on either side -- response fields under `json_schema/`,
element names under `xml/` -- but the shape and the spelling are shared, which is what lets
one side's output be compared against the other's. `xml/flatten_transform.py` renders an
array step with this `ARRAY` for exactly that reason.
"""

from typing import Any

Path = tuple[str, ...]

ARRAY = "[]"


def render(path: Path) -> str:
    """`("applicant", "street1")` -> `"applicant.street1"`."""
    return ".".join(path)


def parse(text: str) -> Path:
    return tuple(text.split("."))


def value_at(data: Any, path: Path) -> Any:
    """The value at `path`, or None if any step is absent. `[]` takes the first item."""
    for step in path:
        if data is None:
            return None
        if step == ARRAY:
            data = data[0] if isinstance(data, list) and data else None
        else:
            data = data.get(step) if isinstance(data, dict) else None
    return data
