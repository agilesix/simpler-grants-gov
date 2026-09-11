"""Does a form's XML mapping agree with the Grants.gov schema it targets?

`RecursiveXMLTransformer` iterates over the mapping's rules, not over the applicant's
answers, so a response field with no rule is never visited and simply does not appear in
the submission. Most Grants.gov elements are `minOccurs="0"`, so the document still
validates and neither `xmllint` nor a snapshot notices.

These checks compare the mapping against the schema directly, so no fixture has to happen
to populate the right field for a mistake to surface. Three sources, all keyed by path:
`wire.elements()`, `rules.read()`, and `paths.inputs()` from the parity suite.

Known gaps are recorded per form in `xml/mappings/` with a reason, and a companion check
fails if an entry stops describing a real gap.
"""

import importlib
import itertools
import json
from types import SimpleNamespace

import pytest

from src.form_schema.jsonschema_resolver import resolve_jsonschema
from tests.src.form_schema.form_spec.parity import paths
from tests.src.form_schema.form_spec.xml import rules, wire
from tests.src.form_schema.form_spec.xml.mappings import (
    key_contacts,
    key_contacts_portable,
    sf424,
    sf424_portable,
    sf424_short,
    sf424a,
)

MAPPINGS = [
    sf424.MAPPING,
    sf424_portable.MAPPING,
    sf424_short.MAPPING,
    sf424a.MAPPING,
    key_contacts.MAPPING,
    key_contacts_portable.MAPPING,
]


@pytest.fixture(scope="module", params=MAPPINGS, ids=lambda m: m.module)
def form(request):
    """One form: its record, its mapping, its schema, and its own inputs."""
    record = request.param
    module = importlib.import_module(f"src.form_schema.forms.{record.module}")
    # A hand-written form exports module-level constants; a generated one exports the Form
    # the loader built from its form.json.
    generated = getattr(module, "FORM", None)
    mapping = generated.json_to_xml_schema if generated else module.FORM_XML_TRANSFORM_RULES
    targets, unreadable = rules.read(mapping)

    return SimpleNamespace(
        record=record,
        targets=targets,
        unreadable=unreadable,
        declared=wire.elements(rules.xsd_of(mapping), rules.root_of(mapping)),
        attachments=rules.attachment_elements(mapping),
        by_path=paths.inputs(resolve_jsonschema(module.FORM_JSON_SCHEMA)),
        inputs={
            paths.render(p)
            for p in paths.inputs(
                resolve_jsonschema(
                    generated.form_json_schema if generated else module.FORM_JSON_SCHEMA
                )
            )
        },
        sources={source for source in targets.values() if source},
        transformed=rules.transformed(mapping),
    )


def _readable(form) -> None:
    """Skip a form whose mapping builds its structure at run time rather than declaring it."""
    if form.record.unreadable:
        pytest.skip(
            f"{form.record.module}: mapping is not read structurally -- "
            + "; ".join(f"{k}: {why}" for k, why in sorted(form.record.unreadable.items()))
        )


def _reaches(field: str, sources: set[str]) -> bool:
    """Whether some rule reads `field`, or reads a field that contains it."""
    return any(field == s or field.startswith(s + ".") for s in sources)


def _governed(form):
    """Yields `(element path, response field, form rules, element)` for each element fed by
    exactly one field.

    Skips containers, and sources naming a subtree rather than one input -- an attachment
    field, or the array behind a `one_to_many` expansion.
    """
    for path, source in form.targets.items():
        if source is None:
            continue
        governed = form.by_path.get(paths.parse(source))
        element = form.declared.get(path)
        if governed is None or element is None:
            continue
        yield path, source, {k: json.loads(v) for k, v in governed.rules}, element


def _reconciled(form, path: wire.Path, keyword: str) -> bool:
    """Whether a declared `value_transform` could account for a difference in `keyword`."""
    declared = form.transformed.get(path, frozenset())
    return bool(declared & rules.RECONCILED_BY.get(keyword, frozenset()))


def _gap(form, path: wire.Path, keyword: str) -> bool:
    """Whether this difference is already recorded, so the check should pass over it."""
    return f"{wire.render(path)}/{keyword}" in form.record.constraint_gaps


def _from_attachment(path: wire.Path, attachments: frozenset[str]) -> bool:
    """Whether an element's value comes from an uploaded file rather than the mapping."""
    return bool(path) and path[0] in attachments and len(path) > 1


# --- the reader's own preconditions ----------------------------------------


class TestMappingReadability:
    """Whether a mapping's wire structure can be derived from its declaration."""

    def test_the_record_agrees_with_what_can_actually_be_read(self, form):
        """A form is skipped for the reasons its record gives, and no others."""
        assert set(form.unreadable) == set(form.record.unreadable), (
            f"{form.record.module}: the reader cannot derive "
            f"{sorted(set(form.unreadable) - set(form.record.unreadable))} and the record does "
            f"not say so; the record claims "
            f"{sorted(set(form.record.unreadable) - set(form.unreadable))} which now reads fine"
        )


# --- mapping against schema ------------------------------------------------


class TestXsdElementCoverage:
    """Every element the XSD declares, sourced and in sequence order."""

    def test_every_target_names_an_element_the_schema_declares(self, form):
        """Catches a misspelled target, one at the wrong nesting level, or an element a schema
        revision renamed or removed."""
        _readable(form)

        unknown = sorted(wire.render(path) for path in form.targets if path not in form.declared)
        assert not unknown, (
            f"{form.record.module}: {len(unknown)} target(s) name nothing in "
            f"{form.record.module}'s schema: {unknown}"
        )

    def test_every_element_the_schema_requires_is_mapped(self, form):
        """Nothing Grants.gov demands is left without a source.

        Attachment subtrees are exempt: they come from the uploaded file, not the mapping.
        """
        _readable(form)

        missing = sorted(
            wire.render(path)
            for path, element in form.declared.items()
            if element.required
            and path not in form.targets
            and not _from_attachment(path, form.attachments)
        )
        assert not missing, (
            f"{form.record.module}: {len(missing)} required element(s) have no source, so a "
            f"submission would omit them: {missing}"
        )

    def test_mapped_elements_follow_the_schema_sequence(self, form):
        """Within each parent, the mapping declares elements in schema sequence order.

        The transformer emits in mapping order and Grants.gov declares `xs:sequence`, so this
        is load-bearing -- and maintained only as key order in a Python dictionary.
        """
        _readable(form)

        ordered = [
            path
            for path in form.targets
            if path in form.declared and form.declared[path].position >= 0
        ]
        out_of_order = []
        for parent, group in itertools.groupby(
            sorted(ordered, key=lambda p: p[:-1]), lambda p: p[:-1]
        ):
            siblings = set(group)
            as_mapped = [p for p in ordered if p in siblings]
            as_declared = sorted(siblings, key=lambda p: form.declared[p].position)
            if as_mapped != as_declared:
                out_of_order.append(
                    f"{wire.render(parent) or '(root)'}: mapped "
                    f"{[p[-1] for p in as_mapped]}, schema declares {[p[-1] for p in as_declared]}"
                )
        assert not out_of_order, f"{form.record.module}: " + "; ".join(out_of_order)


# --- mapping against the form ----------------------------------------------


class TestResponseFieldCoverage:
    """Every response field mapped to an element, and every rule reading a real field."""

    def test_every_response_field_reaches_an_element(self, form):
        """Everything an applicant can fill in ends up somewhere in the submission."""
        _readable(form)

        dropped = sorted(
            field
            for field in form.inputs
            if not _reaches(field, form.sources) and field not in form.record.dropped
        )
        assert not dropped, (
            f"{form.record.module}: {len(dropped)} response field(s) reach no XML element, so "
            f"an applicant's answer would not be submitted: {dropped}"
        )

    def test_every_rule_reads_a_field_the_form_has(self, form):
        """No rule reads a response field that does not exist.

        The element such a rule targets *is* mapped, so the schema-side checks see nothing.
        """
        _readable(form)

        misdirected = sorted(
            source
            for source in form.sources
            if not any(field == source or field.startswith(source + ".") for field in form.inputs)
            and source not in form.record.misdirected
        )
        assert not misdirected, (
            f"{form.record.module}: {len(misdirected)} rule(s) read a field this form does not "
            f"have: {misdirected}"
        )


# --- form constraints against wire constraints -----------------------------

#: For each bound, which direction makes the form the looser of the two.
LOOSER = {"maxLength": "above", "maximum": "above", "minLength": "below", "minimum": "below"}

#: `minimum`/`maximum` say nothing about a string, so a form holding a decimal as text --
#: which every money field does, to keep a cent off binary floating point -- carries the
#: range in its pattern instead. These are read from the pattern rather than looked up.
FROM_PATTERN = ("minimum", "maximum")


class TestFormConstraintContainment:
    """Whether the form is at least as strict as the elements it feeds."""

    def test_no_field_offers_a_value_its_element_rejects(self, form):
        """Every option a form lists is a member of the element's enumeration.

        Set comparison settles a 261-member code list at once, where sampling would need
        hundreds of draws to reach any particular member.
        """
        _readable(form)

        offered = []
        for path, source, governed, element in _governed(form):
            listed = element.rules.get("enum")
            if "enum" not in governed or not isinstance(listed, frozenset):
                continue
            if _reconciled(form, path, "enum") or _gap(form, path, "enum"):
                continue
            extra = sorted(set(governed["enum"]) - listed)
            if extra:
                offered.append(f"{wire.render(path)} <- {source}: {extra}")
        assert not offered, (
            f"{form.record.module}: {len(offered)} field(s) offer a value the element does not "
            f"list, so choosing it would produce a submission Grants.gov rejects: {offered}"
        )

    def test_no_field_accepts_a_value_its_element_cannot_carry(self, form):
        """A form is at least as strict as the element it feeds.

        Containment, not equality: a form stricter than the wire is fine. Declaring nothing
        where the element declares a bound counts as looser.
        """
        _readable(form)

        looser = []
        for path, source, governed, element in _governed(form):
            for keyword, direction in LOOSER.items():
                limit = element.rules.get(keyword)
                if limit is None:
                    continue
                # A `minLength` of 0 asks nothing of anyone -- a string is never shorter than
                # that -- so a form declaring no minimum is not looser than it.
                if keyword == "minLength" and limit == 0:
                    continue
                if _reconciled(form, path, keyword) or _gap(form, path, keyword):
                    continue
                declared = governed.get(keyword)
                if keyword in FROM_PATTERN and governed.get("type") == "string":
                    permitted = wire.implied_range(governed.get("pattern", ""))
                    if permitted is None:
                        looser.append(
                            f"{wire.render(path)} <- {source}: the element bounds {keyword} at "
                            f"{limit}, the field is a string, and its pattern "
                            f"{governed.get('pattern', '(none)')!r} does not say what range it "
                            f"permits -- so nothing checks it"
                        )
                        continue
                    declared = permitted[0] if keyword == "minimum" else permitted[1]

                if declared is None:
                    looser.append(f"{wire.render(path)} <- {source}: no {keyword}, element {limit}")
                elif (declared > limit) if direction == "above" else (declared < limit):
                    looser.append(
                        f"{wire.render(path)} <- {source}: {keyword} {declared} against element {limit}"
                    )
        assert not looser, (
            f"{form.record.module}: {len(looser)} field(s) accept more than the element carries, "
            f"so an applicant could fill in something unsubmittable: {looser}"
        )

    def test_every_field_can_become_the_type_its_element_expects(self, form):
        """Where a field's JSON type differs from its element's, a transform is declared.

        A boolean reaching a `YesNoDataType` string needs `boolean_to_yes_no`; omitting it is
        invisible until a document is generated with that field populated.
        """
        _readable(form)

        mismatched = []
        for path, source, governed, element in _governed(form):
            expected = wire.PRIMITIVES.get(element.primitive or "")
            declared = governed.get("type")
            if not expected or not declared or declared == expected:
                continue
            if _reconciled(form, path, "type") or _gap(form, path, "type"):
                continue
            mismatched.append(
                f"{wire.render(path)} <- {source}: form {declared}, element "
                f"xs:{element.primitive}, no value_transform declared"
            )
        assert not mismatched, (
            f"{form.record.module}: {len(mismatched)} field(s) would reach serialisation as the "
            f"wrong type: {mismatched}"
        )


# --- the record itself -----------------------------------------------------


class TestGapRecordIntegrity:
    """Whether a recorded gap is usable and still describes something real."""

    def test_every_recorded_entry_gives_a_reason(self, form):
        """A register entry without a real reason is an allow-list pretending to be evidence.

        Added after a docstring edit replaced two shared citations with the text of the script
        that was meant to write them. Nothing read the reasons, so it went unnoticed.
        """
        unusable = sorted(
            f"{register}[{key!r}]: {reason!r}"
            for register, entries in (
                ("dropped", form.record.dropped),
                ("misdirected", form.record.misdirected),
                ("constraint_gaps", form.record.constraint_gaps),
                ("unreadable", form.record.unreadable),
            )
            for key, reason in entries.items()
            if len(reason.strip()) < 40 or "{" in reason or "repr(" in reason
        )
        assert not unusable, f"{form.record.module}: " + "; ".join(unusable)

    def test_recorded_gaps_still_exist(self, form):
        """A recorded gap cannot outlive the problem it describes."""
        _readable(form)

        fixed = sorted(field for field in form.record.dropped if _reaches(field, form.sources))
        gone = sorted(field for field in form.record.dropped if field not in form.inputs)
        resolved = sorted(
            source
            for source in form.record.misdirected
            if any(field == source or field.startswith(source + ".") for field in form.inputs)
        )
        unused = sorted(source for source in form.record.misdirected if source not in form.sources)

        # A constraint gap has to still name a mapped element and a rule that element declares.
        by_element = {wire.render(path): element for path, element in form.declared.items()}
        stale_gaps = []
        for entry in form.record.constraint_gaps:
            element, _, keyword = entry.rpartition("/")
            declared = by_element.get(element)
            if declared is None:
                stale_gaps.append(f"{entry} (no such element)")
            elif keyword == "type":
                if declared.primitive is None:
                    stale_gaps.append(f"{entry} (element has no simple type)")
            elif keyword not in declared.rules:
                stale_gaps.append(f"{entry} (element declares no {keyword})")

        complaints = []
        if fixed:
            complaints.append(f"now mapped, so remove from `dropped`: {fixed}")
        if gone:
            complaints.append(f"no longer fields on this form, so remove from `dropped`: {gone}")
        if resolved:
            complaints.append(f"now name real fields, so remove from `misdirected`: {resolved}")
        if unused:
            complaints.append(f"no longer rule sources, so remove from `misdirected`: {unused}")
        if stale_gaps:
            complaints.append(
                f"no longer describe a real restriction, so remove from `constraint_gaps`: {stale_gaps}"
            )
        assert not complaints, f"{form.record.module}: " + "; ".join(complaints)
