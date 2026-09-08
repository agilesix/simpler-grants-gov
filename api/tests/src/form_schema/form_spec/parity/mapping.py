"""The correspondence between a SimplerForms form and the hand-written form it mirrors.

Correspondence is assumed, not enumerated: a path both forms have under the same name
corresponds to itself, and a mapping declares only the departures -- what was renamed, and
what one side has that the other does not.

That does not weaken the totality checks. A field present on only one side is not in the
intersection, so it corresponds to nothing and must be declared in one of the `absent`
registers with a reason.
"""

import dataclasses

from . import paths
from .paths import Input, Path


@dataclasses.dataclass(frozen=True)
class FormMapping:
    """Where one form's inputs do *not* simply correspond to the other's.

    `renamed` maps a generated path to the handwritten path meaning the same thing. The
    two `absent` registers are the only way a field escapes the totality checks, so each
    entry needs a reason.
    """

    generated_module: str
    handwritten_module: str
    renamed: dict[str, str] = dataclasses.field(default_factory=dict)
    absent_from_handwritten: dict[str, str] = dataclasses.field(default_factory=dict)
    absent_from_generated: dict[str, str] = dataclasses.field(default_factory=dict)
    # `"path/keyword"` -> the citation showing the hand-written form is the one that
    # disagrees with the official schema. Not permission for the difference to exist: each
    # entry is a defect for Simpler Grants to fix, recorded so the suite stays green while
    # they do. `stale_entries` fails if an entry stops naming a real input.
    upstream_rule_defects: dict[str, str] = dataclasses.field(default_factory=dict)


def pairs(
    mapping: FormMapping,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> dict[Path, Path]:
    """Generated path -> handwritten path, for every input that corresponds.

    A declared rename wins; otherwise a shared path corresponds to itself. A path already
    used as a rename's target is not also matched to itself, so an ambiguous mapping
    leaves both ends unaccounted for rather than pairing them two ways.
    """
    renamed = {paths.parse(k): paths.parse(v) for k, v in mapping.renamed.items()}
    taken = set(renamed.values())

    out = dict(renamed)
    for path in generated:
        if path in renamed or path in taken or path not in handwritten:
            continue
        out[path] = path
    return out


@dataclasses.dataclass(frozen=True)
class Discrepancy:
    kind: str
    path: str
    detail: str = ""

    def __str__(self) -> str:
        return f"{self.kind}: {self.path}{f' -- {self.detail}' if self.detail else ''}"


def stale_entries(
    mapping: FormMapping,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> list[Discrepancy]:
    """Mapping entries naming a field that does not exist on the side they claim."""
    out = []
    for generated_path, handwritten_path in pairs(mapping, generated, handwritten).items():
        if generated_path not in generated:
            out.append(Discrepancy("no such generated input", paths.render(generated_path)))
        if handwritten_path not in handwritten:
            out.append(Discrepancy("no such handwritten input", paths.render(handwritten_path)))
    for generated_path, handwritten_path in mapping.renamed.items():
        if generated_path == handwritten_path:
            out.append(
                Discrepancy(
                    "rename to the same path",
                    generated_path,
                    "identical paths already correspond, so this entry says nothing",
                )
            )
    for path, reason in mapping.absent_from_handwritten.items():
        if paths.parse(path) not in generated:
            out.append(Discrepancy("declared absent but not a generated input", path, reason))
    for path, reason in mapping.absent_from_generated.items():
        if paths.parse(path) not in handwritten:
            out.append(Discrepancy("declared absent but not a handwritten input", path, reason))
    for key in mapping.upstream_rule_defects:
        path = key.rsplit("/", 1)[0]
        if paths.parse(path) not in generated:
            out.append(Discrepancy("recorded defect names no such input", path))
    return out


def unmapped(
    mapping: FormMapping,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> list[Discrepancy]:
    """Inputs the mapping accounts for on neither side.

    An unaccounted handwritten input is a field an applicant can fill in on the form that
    ships and cannot on the generated one.
    """
    declared_generated = {paths.parse(p) for p in mapping.absent_from_handwritten}
    declared_handwritten = {paths.parse(p) for p in mapping.absent_from_generated}
    corresponding = pairs(mapping, generated, handwritten)
    mapped_generated = set(corresponding)
    mapped_handwritten = set(corresponding.values())

    out = []
    for path in sorted(set(generated) - mapped_generated - declared_generated):
        out.append(Discrepancy("generated input is unmapped", paths.render(path)))
    for path in sorted(set(handwritten) - mapped_handwritten - declared_handwritten):
        out.append(Discrepancy("handwritten input is unmapped", paths.render(path)))
    return out


def rule_conflicts(
    mapping: FormMapping,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> list[Discrepancy]:
    """Corresponding inputs governed by different rules.

    Every keyword that can make a payload invalid, plus requiredness, reported keyword by
    keyword. Presentation is not compared: that belongs to the UI checks.
    """
    recorded = mapping.upstream_rule_defects
    out = []
    for generated_path, handwritten_path in pairs(mapping, generated, handwritten).items():
        if generated_path not in generated or handwritten_path not in handwritten:
            continue
        generated_rules = generated[generated_path]
        handwritten_rules = handwritten[handwritten_path]
        where = paths.render(generated_path)

        if (
            generated_rules.required != handwritten_rules.required
            and f"{where}/required" not in recorded
        ):
            out.append(
                Discrepancy(
                    "requiredness differs",
                    where,
                    f"generated {'required' if generated_rules.required else 'optional'}, "
                    f"handwritten {'required' if handwritten_rules.required else 'optional'}",
                )
            )

        a, b = generated_rules.as_dict, handwritten_rules.as_dict
        for keyword in sorted(set(a) | set(b)):
            if a.get(keyword) == b.get(keyword):
                continue
            if f"{where}/{keyword}" in recorded:
                continue
            out.append(
                Discrepancy(
                    f"{keyword} differs",
                    where,
                    f"generated {a.get(keyword, '(absent)')}, handwritten {b.get(keyword, '(absent)')}",
                )
            )
    return out
