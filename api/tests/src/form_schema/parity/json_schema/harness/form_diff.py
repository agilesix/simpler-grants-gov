"""What may differ between a generated form and the hand-written form it mirrors.

Correspondence is assumed, not enumerated: a path both forms have under the same name
corresponds to itself, and this record declares only the departures -- what was renamed,
and what one side has that the other does not.

That does not weaken the totality checks. A field present on only one side corresponds to
nothing, so it must be declared in one of the `absent` registers with a reason.
"""

import dataclasses

from ... import form_diff as shared


@dataclasses.dataclass(frozen=True, kw_only=True)
class FormDiff(shared.FormDiff):
    """Where one form's inputs do *not* simply correspond to the other's.

    The definition is the generated form; the source is the hand-written form it mirrors.
    The two `absent` registers are the only way a field escapes the totality checks, so
    each entry needs a reason.

    `differing_rules` cites the official Grants.gov schema showing the *hand-written* form
    is the one that disagrees with it. Not permission for the difference to exist: each
    entry is a defect for Simpler Grants to fix, recorded so the suite stays green while
    they do, and `compare.stale_entries` fails if an entry stops naming a real input.
    """

    generated_module: str
    handwritten_module: str

    #: Generated path -> the handwritten path meaning the same thing.
    renamed: dict[str, str] = dataclasses.field(default_factory=dict)
