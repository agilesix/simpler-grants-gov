"""Checks that read a `FormDiff` and nothing else, so both sides share them.

Everything here holds a record against itself rather than against a form, which is why it
needs no flattened document and works for any side's `FormDiff` -- including one a future
side adds, since the registers are read off the dataclass rather than listed by hand.
"""

import dataclasses

from .discrepancy import Discrepancy
from .form_diff import FormDiff

#: Shorter than this and a reason is a label, not something a maintainer can act on.
MINIMUM_REASON = 40

#: Leftovers from a template that was never filled in. Both appeared in a real entry.
TEMPLATE_MARKERS = ("{", "repr(")


def registers(diff: FormDiff) -> list[tuple[str, dict[str, str]]]:
    """Every `path -> reason` register the record declares, by name.

    Read off the dataclass, so a side that adds one gets it checked without listing it
    here -- and a dictionary that is not a register does not get held to a standard it
    was never meant to meet.
    """
    return [
        (f.name, getattr(diff, f.name))
        for f in dataclasses.fields(diff)
        if f.metadata.get("register")
    ]


def usable_reasons(diff: FormDiff) -> list[Discrepancy]:
    """Entries whose reason a maintainer could not act on.

    An entry without a real reason is an allow-list pretending to be evidence. Added after
    a docstring edit replaced two shared citations with the text of the script that was
    meant to write them -- nothing read the reasons, so it went unnoticed.
    """
    return [
        Discrepancy("unusable reason", f"{register}[{key!r}]", repr(reason))
        for register, entries in registers(diff)
        for key, reason in entries.items()
        if len(reason.strip()) < MINIMUM_REASON or any(m in reason for m in TEMPLATE_MARKERS)
    ]
