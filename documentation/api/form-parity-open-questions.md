# Form parity — open questions

**Status:** open questions, not decisions. The XML-mapping counterpart is
`xml-mapping-static-analysis-notes.md`; this file covers the JSON-schema side
(`api/tests/src/form_schema/parity/json_schema/`).

## The one failing check: `sf424a` activity title requiredness

```
FAILED json_schema/test_forms.py::TestGeneratedVsHandwritten
       ::test_generated_form_requires_the_same_fields[sf424a_portable]

  requiredness differs: activity_line_items.[].activity_title
  -- generated required, handwritten optional
```

This is the only red on `widal001/sgg-form-emitters` and it predates the parity
suite's reorganisation. Three separate things are tangled in it.

### 1. The two forms encode different models of a row

The generated form, from `forms/specs/forms/sf424a.tsp`:

```typespec
model ActivityLineItem {
  activityTitle: BudgetActivityTitle;   // not optional
  assistanceListingNumber?: ...;        // everything else is
}
```

→ `$defs.ActivityLineItem.required = ["activity_title"]`, unconditionally, on
every row. A row is something you create when you have an activity, so a row
without a title is not a row. Consistent with `@minItems(1)`.

The hand-written form, `src/form_schema/forms/sf424a/1/0/form_json.py`:

```python
"activity_line_items": {
    "minItems": 1, "maxItems": 4,
    # row 1, always
    "allOf": [{"prefixItems": [{"required": ["activity_title"]}]}],
    "items": {
        # rows 2-4, only when the row has budget data
        "allOf": [{"if": {...}, "then": {"required": ["activity_title"]}}],
    },
}
```

→ four fixed slots, mostly blank, titled only when used. The conditional exists
because the frontend renders Section A as four rows.

Neither is provably wrong. The generated reading is cleaner and is what the spec
deliberately encodes; the hand-written one matches how the table is rendered.

### 2. Whatever either form decides is unobservable at submission

`SF424A-V1.0.xsd` declares **no element for an activity title at all** — a
Section A row is identified on the wire by `CFDANumber`. The free-text programme
name is never submitted. This is a UI-validation question, not a
schema-conformance one.

The sibling entry already in `json_schema/diffs/sf424a.py` records exactly this
for `minLength` on the same field.

### 3. The harness understates the hand-written form

`flatten_schema.inputs()` reads only `merged.get("items")`. `merge_allof` folds
the `allOf` correctly — the merged array node *does* carry `prefixItems` —
but nothing reads it:

```python
>>> merged = merge_allof(resolve_jsonschema(HW)["properties"]["activity_line_items"])
>>> sorted(merged)
['items', 'maxItems', 'minItems', 'prefixItems', 'type']
>>> merged["prefixItems"]
[{'required': ['activity_title']}]      # never read
```

So "handwritten optional" is **partly an artifact**. The hand-written form does
require the title unconditionally on row 1.

### Recommended fix

Record it, with a reason that is honest about all three points. Note this would
be the first entry on the branch where the *generated* form is the stricter
side — every other `differing_rules` entry says the hand-written form is wrong
per the XSD, and this one cannot say that. It is a judgement about the paper
form and should be confirmed by the SGG team before landing.

Draft entry for `json_schema/diffs/sf424a.py`, alongside the existing
`activity_line_items.[].activity_title/minLength`:

```python
"activity_line_items.[].activity_title/required": (
    "Not backed by the XSD, like the minLength entry on the same field. "
    "SF424A-V1.0.xsd declares no element for an activity title -- a Section A "
    "row is identified on the wire by CFDANumber -- so neither form's choice "
    "is observable in a submission. The generated form requires a title on "
    "every row, reading a row as something created when there is an activity. "
    "The hand-written form requires it on row 1 via prefixItems and on rows "
    "2-4 only when the row carries budget data, reading Section A as four "
    "fixed slots. Note the comparison cannot see the prefixItems half: "
    "flatten_schema.inputs() reads only `items`, so it reports the "
    "hand-written form as optional when row 1 is unconditionally required."
),
```

### What not to do

- **Do not teach `flatten_schema` to fold `prefixItems` into `items`.** That
  would assert all four rows require a title, which is false.
- **Do not change the generated form to match.** The spec's model is defensible
  and the difference is unobservable at submission.

## Harness limitation: positional array items

`prefixItems` says item 0 has a different shape from items 1+. The path model is
one path per array — `activity_line_items.[].activity_title` — because a form
declares one shape for its items and one path describes them all. There is no
honest way to represent positional differences without positional paths, which
is a much larger change than this one form warrants.

`sf424a` is the **only** form in `src/form_schema/forms/` using `prefixItems`,
so the blind spot is contained. It should be documented in
`json_schema/harness/flatten_schema.py` next to the `[]` explanation, so the
next person can tell an artifact from a finding.

## Also open on this branch

- `json_schema/test_conflicts.py` does not exist. Its content would be the
  property-based counterpart: generate payloads, require the API's own validator
  to reach the same verdict against both schemas. Why it is not there is in
  `json_schema/parity/README.md`.
- `sf424a_portable` has no XML mapping at all — no `xml_transform.json`, no
  `forms/specs/xml/sf424a.json`, no record in `xml/diffs/`. It needs one written
  declaratively against `SF424A-V1.0.xsd`, since the hand-written `sf424a`
  mapping is itself unreadable. See `xml-mapping-static-analysis-notes.md`.
