"""One thing a check found, in a form both sides report the same way."""

import dataclasses


@dataclasses.dataclass(frozen=True)
class Discrepancy:
    """What disagrees, where, and -- where it helps -- the two readings side by side."""

    kind: str
    path: str
    detail: str = ""

    def __str__(self) -> str:
        return f"{self.kind}: {self.path}{f' -- {self.detail}' if self.detail else ''}"
