"""What is known to be wrong with one form's XML mapping.

The counterpart of `parity/mapping.py`: hand-written, a reason per entry, and checked for
staleness so an entry cannot outlive the problem it describes.
"""

import dataclasses


@dataclasses.dataclass(frozen=True)
class WireMapping:
    """One form's mapping, and the gaps between it and the schema it targets."""

    #: Package under `src.form_schema.forms` exporting `FORM_JSON_SCHEMA` and
    #: `FORM_XML_TRANSFORM_RULES`.
    module: str

    #: Response field -> why no XML element carries it. Each is a field an applicant can
    #: fill in whose value does not reach the submission. The elements are all optional in
    #: the XSD, so the document validates without them and XSD checking cannot find these.
    dropped: dict[str, str] = dataclasses.field(default_factory=dict)

    #: Rule source -> why it names no response field. Such a rule contributes nothing and
    #: the element it targets is silently absent.
    misdirected: dict[str, str] = dataclasses.field(default_factory=dict)

    #: `"element path/keyword"` -> the citation showing the form permits something the
    #: element cannot carry. A defect list for Simpler Grants, not permission.
    constraint_gaps: dict[str, str] = dataclasses.field(default_factory=dict)

    #: Rule key -> why the reader will not derive its wire structure. A form with any of
    #: these is skipped by the structural checks.
    unreadable: dict[str, str] = dataclasses.field(default_factory=dict)
