"""What a maintainer has declared about one form, and every departure they accepted.

Each side compares a form definition against a source and reports what disagrees. Almost
everything lines up; the rest is declared here, by hand, and the three registers below
cover the ways two documents can differ:

- the definition has something the source does not
- the source has something the definition does not reach
- both have it, and they govern it by different rules

A register is `path -> reason`, and the reason is the point. The checks hold each entry to
both documents, so a register cannot outlive the problem it describes, and an entry whose
reason a maintainer could not act on is an allow-list pretending to be evidence.

Declaring a departure is never permission for it to exist. Each entry is a defect for
someone to fix, recorded so the suite stays green while they do.

Each side extends this with how it names the documents it reads, and with whatever it
alone needs: `json_schema/` adds `renamed`, `xml/` adds `unreadable`.
"""

import dataclasses

#: Marks a field as a `path -> reason` register, whose every entry has to justify itself.
#:
#: Declared rather than inferred from the type: a record may hold other dictionaries --
#: `renamed` maps one path to another -- whose values are not reasons and which
#: `compare.usable_reasons` must not hold to a reason's standard.
REGISTER = {"register": True}


@dataclasses.dataclass(frozen=True, kw_only=True)
class FormDiff:
    """The departures one form's definition is allowed to have from its source."""

    #: Path in the definition -> why nothing in the source corresponds to it.
    absent_from_source: dict[str, str] = dataclasses.field(default_factory=dict, metadata=REGISTER)

    #: Path in the source -> why the definition reaches nothing corresponding.
    absent_from_definition: dict[str, str] = dataclasses.field(
        default_factory=dict, metadata=REGISTER
    )

    #: `"path/keyword"` -> the citation showing which side is wrong, for a rule the two
    #: declare differently.
    differing_rules: dict[str, str] = dataclasses.field(default_factory=dict, metadata=REGISTER)
