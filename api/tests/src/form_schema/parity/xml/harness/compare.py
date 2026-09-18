"""Holding a form's XML mapping against the two documents it has to agree with.

The mapping is read into `{element path: response field}`, the Grants.gov XSD into
`{element path: Element}`, and the form's own schema into `{field path: Input}`. Every
check below is then a dictionary comparison, so no fixture has to happen to populate the
right field for a mistake to surface.

Three comparisons, in the order a reader should meet them:

    mapping against the XSD          undeclared_targets, unsourced_elements,
                                     out_of_order_elements
    mapping against the form         unmatched_fields
    the form against the XSD         rule_differences

and `stale_entries`, which holds the record against all three. The XSD comparison takes no
exceptions: a target naming an element the schema does not declare, or a required element
nothing feeds, fails with nothing to record against it.
"""

import dataclasses
import importlib
import itertools
import json

from src.form_schema.jsonschema_resolver import resolve_jsonschema
from tests.src.form_schema.parity import paths
from tests.src.form_schema.parity.discrepancy import Discrepancy
from tests.src.form_schema.parity.json_schema.harness import flatten_schema
from tests.src.form_schema.parity.json_schema.harness.flatten_schema import Input
from tests.src.form_schema.parity.paths import Path
from tests.src.form_schema.parity.xml.harness import flatten_transform, flatten_xsd
from tests.src.form_schema.parity.xml.harness.form_diff import FormDiff

#: For each bound, which direction makes the form the looser of the two.
LOOSER = {"maxLength": "above", "maximum": "above", "minLength": "below", "minimum": "below"}

#: `minimum`/`maximum` say nothing about a string, so a form holding a decimal as text --
#: which every money field does, to keep a cent off binary floating point -- carries the
#: range in its pattern instead. These are read from the pattern rather than looked up.
FROM_PATTERN = ("minimum", "maximum")


@dataclasses.dataclass(frozen=True)
class FlatForm:
    """One form's mapping, flattened, beside the two documents it is held against."""

    diff: FormDiff

    #: Element path -> the response field feeding it, or None where it takes no value.
    targets: dict[Path, str | None]

    #: Rule key -> why its wire structure could not be derived. Empty for a readable form.
    unreadable: dict[str, str]

    #: The Grants.gov XSD the mapping targets.
    declared: dict[Path, flatten_xsd.Element]

    #: Elements the attachment transformer builds from an upload rather than the mapping.
    attachments: frozenset[str]

    #: The form's own fields, for reading the rules that govern one.
    by_path: dict[Path, Input]

    #: The same fields rendered as dotted strings, for comparing against rule sources.
    inputs: frozenset[str]

    #: Element path -> the `value_transform` types its rule declares.
    transformed: dict[Path, frozenset[str]]

    @property
    def sources(self) -> set[str]:
        """Every response field some rule reads."""
        return {source for source in self.targets.values() if source}


def flatten(diff: FormDiff) -> FlatForm:
    """Read one form's mapping, the schema it targets, and its own fields."""
    module = importlib.import_module(f"src.form_schema.forms.{diff.module}")
    # A hand-written form exports module-level constants; a generated one exports the Form
    # the loader built from its form.json.
    generated = getattr(module, "FORM", None)
    mapping = generated.json_to_xml_schema if generated else module.FORM_XML_TRANSFORM_RULES
    targets, unreadable = flatten_transform.read(mapping)
    own_schema = generated.form_json_schema if generated else module.FORM_JSON_SCHEMA

    return FlatForm(
        diff=diff,
        targets=targets,
        unreadable=unreadable,
        declared=flatten_xsd.elements(
            flatten_transform.xsd_of(mapping), flatten_transform.root_of(mapping)
        ),
        attachments=flatten_transform.attachment_elements(mapping),
        by_path=flatten_schema.inputs(resolve_jsonschema(module.FORM_JSON_SCHEMA)),
        inputs=frozenset(
            paths.render(p) for p in flatten_schema.inputs(resolve_jsonschema(own_schema))
        ),
        transformed=flatten_transform.transformed(mapping),
    )


# --- reading one element at a time -----------------------------------------


def _reaches(field: str, sources: set[str]) -> bool:
    """Whether some rule reads `field`, or reads a field that contains it."""
    return any(field == s or field.startswith(s + ".") for s in sources)


def _governed(flat: FlatForm):
    """Yields `(element path, response field, form rules, element)` for each element fed by
    exactly one field.

    Skips containers, and sources naming a subtree rather than one input -- an attachment
    field, or the array behind a `one_to_many` expansion.
    """
    for path, source in flat.targets.items():
        if source is None:
            continue
        governed = flat.by_path.get(paths.parse(source))
        element = flat.declared.get(path)
        if governed is None or element is None:
            continue
        yield path, source, {k: json.loads(v) for k, v in governed.rules}, element


def _reconciled(flat: FlatForm, path: Path, keyword: str) -> bool:
    """Whether a declared `value_transform` could account for a difference in `keyword`."""
    declared = flat.transformed.get(path, frozenset())
    return bool(declared & flatten_transform.RECONCILED_BY.get(keyword, frozenset()))


def _recorded(flat: FlatForm, path: Path, keyword: str) -> bool:
    """Whether this difference is already recorded, so the check should pass over it."""
    return f"{paths.render(path)}/{keyword}" in flat.diff.differing_rules


def _from_attachment(path: Path, attachments: frozenset[str]) -> bool:
    """Whether an element's value comes from an uploaded file rather than the mapping."""
    return bool(path) and path[0] in attachments and len(path) > 1


# --- the mapping against the XSD -------------------------------------------


def undeclared_targets(flat: FlatForm) -> list[Discrepancy]:
    """Targets naming nothing the schema declares.

    Catches a misspelled target, one at the wrong nesting level, or an element a schema
    revision renamed or removed.
    """
    return [
        Discrepancy("target names no element", paths.render(path))
        for path in sorted(flat.targets)
        if path not in flat.declared
    ]


def unsourced_elements(flat: FlatForm) -> list[Discrepancy]:
    """Elements the schema requires that nothing feeds.

    Attachment subtrees are exempt: they come from the uploaded file, not the mapping.
    """
    return [
        Discrepancy("required element has no source", paths.render(path))
        for path, element in sorted(flat.declared.items())
        if element.required
        and path not in flat.targets
        and not _from_attachment(path, flat.attachments)
    ]


def out_of_order_elements(flat: FlatForm) -> list[Discrepancy]:
    """Parents whose children the mapping declares out of schema sequence order.

    The transformer emits in mapping order and Grants.gov declares `xs:sequence`, so this
    is load-bearing -- and maintained only as key order in a Python dictionary.
    """
    ordered = [
        path for path in flat.targets if path in flat.declared and flat.declared[path].position >= 0
    ]

    out = []
    for parent, group in itertools.groupby(sorted(ordered, key=lambda p: p[:-1]), lambda p: p[:-1]):
        siblings = set(group)
        as_mapped = [p for p in ordered if p in siblings]
        as_declared = sorted(siblings, key=lambda p: flat.declared[p].position)
        if as_mapped != as_declared:
            out.append(
                Discrepancy(
                    "elements out of sequence",
                    paths.render(parent) or "(root)",
                    f"mapped {[p[-1] for p in as_mapped]}, "
                    f"schema declares {[p[-1] for p in as_declared]}",
                )
            )
    return out


# --- the mapping against the form ------------------------------------------


def unmatched_fields(flat: FlatForm) -> list[Discrepancy]:
    """Fields the mapping never reads, and rules reading fields the form does not have.

    A field no rule reads is an answer that simply does not appear in the submission. A
    rule reading a field that does not exist targets an element that *is* mapped, so the
    schema-side checks see nothing.
    """
    out = [
        Discrepancy("form field is unmapped", field)
        for field in sorted(flat.inputs)
        if not _reaches(field, flat.sources) and field not in flat.diff.absent_from_definition
    ]
    out += [
        Discrepancy("rule source is unknown", source)
        for source in sorted(flat.sources)
        if not any(field == source or field.startswith(source + ".") for field in flat.inputs)
        and source not in flat.diff.absent_from_source
    ]
    return out


# --- the form against the XSD ----------------------------------------------


def rule_differences(flat: FlatForm) -> list[Discrepancy]:
    """Where the form permits something the element it feeds cannot carry.

    Containment, not equality: a form stricter than the wire is fine. Declaring nothing
    where the element declares a bound counts as looser. A difference a declared
    `value_transform` could account for is not reported.
    """
    out = []
    for path, source, governed, element in _governed(flat):
        where, feeds = paths.render(path), f"<- {source}"

        listed = element.rules.get("enum")
        if (
            "enum" in governed
            and isinstance(listed, frozenset)
            and not _reconciled(flat, path, "enum")
            and not _recorded(flat, path, "enum")
        ):
            if extra := sorted(set(governed["enum"]) - listed):
                out.append(Discrepancy("enum differs", where, f"{feeds}: {extra}"))

        for keyword, direction in LOOSER.items():
            limit = element.rules.get(keyword)
            if limit is None:
                continue
            # A `minLength` of 0 asks nothing of anyone -- a string is never shorter than
            # that -- so a form declaring no minimum is not looser than it.
            if keyword == "minLength" and limit == 0:
                continue
            if _reconciled(flat, path, keyword) or _recorded(flat, path, keyword):
                continue

            declared = governed.get(keyword)
            if keyword in FROM_PATTERN and governed.get("type") == "string":
                permitted = flatten_xsd.implied_range(governed.get("pattern", ""))
                if permitted is None:
                    out.append(
                        Discrepancy(
                            "range unreadable",
                            where,
                            f"{feeds}: the element bounds {keyword} at {limit}, the field is a "
                            f"string, and its pattern {governed.get('pattern', '(none)')!r} does "
                            f"not say what range it permits -- so nothing checks it",
                        )
                    )
                    continue
                declared = permitted[0] if keyword == "minimum" else permitted[1]

            if declared is None:
                out.append(
                    Discrepancy(f"{keyword} differs", where, f"{feeds}: none, element {limit}")
                )
            elif (declared > limit) if direction == "above" else (declared < limit):
                out.append(
                    Discrepancy(
                        f"{keyword} differs", where, f"{feeds}: {declared} against element {limit}"
                    )
                )

        expected = flatten_xsd.PRIMITIVES.get(element.primitive or "")
        declared_type = governed.get("type")
        if (
            expected
            and declared_type
            and declared_type != expected
            and not _reconciled(flat, path, "type")
            and not _recorded(flat, path, "type")
        ):
            out.append(
                Discrepancy(
                    "type differs",
                    where,
                    f"{feeds}: form {declared_type}, element xs:{element.primitive}, "
                    f"no value_transform declared",
                )
            )
    return out


# --- the record against all three ------------------------------------------


def stale_entries(flat: FlatForm) -> list[Discrepancy]:
    """Record entries that no longer describe a real difference."""
    out = [
        Discrepancy("now mapped", field, "remove from `absent_from_definition`")
        for field in sorted(flat.diff.absent_from_definition)
        if _reaches(field, flat.sources)
    ]
    out += [
        Discrepancy("no longer a field on this form", field, "remove from `absent_from_definition`")
        for field in sorted(flat.diff.absent_from_definition)
        if field not in flat.inputs
    ]
    out += [
        Discrepancy("now names a real field", source, "remove from `absent_from_source`")
        for source in sorted(flat.diff.absent_from_source)
        if any(field == source or field.startswith(source + ".") for field in flat.inputs)
    ]
    out += [
        Discrepancy("no longer a rule source", source, "remove from `absent_from_source`")
        for source in sorted(flat.diff.absent_from_source)
        if source not in flat.sources
    ]

    # A recorded rule difference has to still name a mapped element and a rule it declares.
    by_element = {paths.render(path): element for path, element in flat.declared.items()}
    for entry in sorted(flat.diff.differing_rules):
        element, _, keyword = entry.rpartition("/")
        declared = by_element.get(element)
        if declared is None:
            out.append(Discrepancy("no such element", entry, "remove from `differing_rules`"))
        elif keyword == "type":
            if declared.primitive is None:
                out.append(
                    Discrepancy(
                        "element has no simple type", entry, "remove from `differing_rules`"
                    )
                )
        elif keyword not in declared.rules:
            out.append(
                Discrepancy(
                    f"element declares no {keyword}", entry, "remove from `differing_rules`"
                )
            )
    return out


def unrecorded_skips(flat: FlatForm) -> list[Discrepancy]:
    """Rules the reader cannot derive that the record does not claim, and the reverse.

    A form is skipped for the reasons its record gives, and no others.
    """
    out = [
        Discrepancy("underivable and unrecorded", rule, why)
        for rule, why in sorted(flat.unreadable.items())
        if rule not in flat.diff.unreadable
    ]
    out += [
        Discrepancy("recorded but now reads fine", rule, why)
        for rule, why in sorted(flat.diff.unreadable.items())
        if rule not in flat.unreadable
    ]
    return out
