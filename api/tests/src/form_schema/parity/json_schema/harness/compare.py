"""Holding a generated form's inputs against the hand-written form's.

Four functions, in the order a reader should meet them. `match_fields` decides which
generated field *is* which hand-written field; the other three each report one way the
two can disagree, every one of them suppressible only by an entry in the `FormDiff`.

    match_fields       which generated field corresponds to which hand-written field
    unmatched_fields   fields on either side that correspond to nothing
    rule_differences   corresponding fields governed by different rules
    stale_entries      FormDiff entries that no longer describe anything real
"""

import dataclasses

from ... import paths
from ...paths import Path
from .flatten_schema import Input
from .form_diff import FormDiff


@dataclasses.dataclass(frozen=True)
class Discrepancy:
    kind: str
    path: str
    detail: str = ""

    def __str__(self) -> str:
        return f"{self.kind}: {self.path}{f' -- {self.detail}' if self.detail else ''}"


def match_fields(
    diff: FormDiff,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> dict[Path, Path]:
    """Generated path -> handwritten path, for every input that corresponds.

    A declared rename wins; otherwise a shared path corresponds to itself. A path already
    used as a rename's target is not also matched to itself, so an ambiguous declaration
    leaves both ends unaccounted for rather than matching one field two ways.
    """
    renamed = {paths.parse(k): paths.parse(v) for k, v in diff.renamed.items()}
    taken = set(renamed.values())

    out = dict(renamed)
    for path in generated:
        if path in renamed or path in taken or path not in handwritten:
            continue
        out[path] = path
    return out


def unmatched_fields(
    diff: FormDiff,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> list[Discrepancy]:
    """Inputs the record accounts for on neither side.

    An unaccounted handwritten input is a field an applicant can fill in on the form that
    ships and cannot on the generated one.
    """
    declared_generated = {paths.parse(p) for p in diff.absent_from_source}
    declared_handwritten = {paths.parse(p) for p in diff.absent_from_definition}
    corresponding = match_fields(diff, generated, handwritten)
    matched_generated = set(corresponding)
    matched_handwritten = set(corresponding.values())

    out = []
    for path in sorted(set(generated) - matched_generated - declared_generated):
        out.append(Discrepancy("generated input is unmapped", paths.render(path)))
    for path in sorted(set(handwritten) - matched_handwritten - declared_handwritten):
        out.append(Discrepancy("handwritten input is unmapped", paths.render(path)))
    return out


def rule_differences(
    diff: FormDiff,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> list[Discrepancy]:
    """Corresponding inputs governed by different rules.

    Every keyword that can make a payload invalid, plus requiredness, reported keyword by
    keyword. Presentation is not compared: that belongs to the UI checks.
    """
    recorded = diff.differing_rules
    out = []
    for generated_path, handwritten_path in match_fields(diff, generated, handwritten).items():
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


def stale_entries(
    diff: FormDiff,
    generated: dict[Path, Input],
    handwritten: dict[Path, Input],
) -> list[Discrepancy]:
    """Record entries naming a field that does not exist on the side they claim."""
    out = []
    for generated_path, handwritten_path in match_fields(diff, generated, handwritten).items():
        if generated_path not in generated:
            out.append(Discrepancy("no such generated input", paths.render(generated_path)))
        if handwritten_path not in handwritten:
            out.append(Discrepancy("no such handwritten input", paths.render(handwritten_path)))
    for generated_path, handwritten_path in diff.renamed.items():
        if generated_path == handwritten_path:
            out.append(
                Discrepancy(
                    "rename to the same path",
                    generated_path,
                    "identical paths already correspond, so this entry says nothing",
                )
            )
    for path, reason in diff.absent_from_source.items():
        if paths.parse(path) not in generated:
            out.append(Discrepancy("declared absent but not a generated input", path, reason))
    for path, reason in diff.absent_from_definition.items():
        if paths.parse(path) not in handwritten:
            out.append(Discrepancy("declared absent but not a handwritten input", path, reason))
    for key in diff.differing_rules:
        path = key.rsplit("/", 1)[0]
        if paths.parse(path) not in generated:
            out.append(Discrepancy("recorded difference names no such input", path))
    return out
