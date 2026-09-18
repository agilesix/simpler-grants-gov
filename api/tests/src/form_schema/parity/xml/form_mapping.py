"""What is known to be wrong with one form's XML mapping.

The counterpart of `../json_schema/form_mapping.py`, over the same three registers: hand
written, a reason per entry, and checked for staleness so an entry cannot outlive the
problem it describes.

The definition is the form's `json_to_xml_schema`. The source those registers speak of is
the form's own JSON Schema -- whether every answer reaches an element, and whether every
rule reads a field that exists.

The other source this side reads, the Grants.gov XSD, has no register at all. A target
naming an element the schema does not declare, or a required element nothing feeds, is a
failure with no way to record an exception, which is deliberate.
"""

import dataclasses

from .. import form_mapping as shared


@dataclasses.dataclass(frozen=True, kw_only=True)
class FormMapping(shared.FormMapping):
    """One form's mapping, and the gaps between it and the schema it targets.

    `absent_from_definition` is a response field no XML element carries: a field an
    applicant can fill in whose value does not reach the submission. The elements are all
    optional in the XSD, so the document validates without them and XSD checking cannot
    find these.

    `absent_from_source` is a rule source naming no response field. Such a rule
    contributes nothing and the element it targets is silently absent.

    `recorded_differences` is keyed by `"element path/keyword"`, and cites the form
    permitting something the element cannot carry.
    """

    #: Package under `src.form_schema.forms` exporting `FORM_JSON_SCHEMA` and
    #: `FORM_XML_TRANSFORM_RULES`.
    module: str

    #: Rule key -> why the reader will not derive its wire structure. A form with any of
    #: these is skipped by the structural checks.
    unreadable: dict[str, str] = dataclasses.field(default_factory=dict)
