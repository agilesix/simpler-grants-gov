# R&R Senior/Key Person Profile (Expanded) — XML mapping not yet written

`rr_key_person_expanded_portable` ships with `json_schema.json`, `ui_schema.json` and
`rule_schema.json`, and no `xml_transform.json`. The form renders, validates and saves; it
cannot be submitted to Grants.gov until this is written. `sf424a_portable` is in the same
state for a different reason, so the pattern is not new.

`forms/specs/xml/rr-key-person-expanded.json` is the file to add. What follows is what was
found while trying to write it, so the next attempt does not rediscover it.

## The obstacle

`RR_KeyPersonExpanded_4_0-V4.0.xsd` wraps every person in an element with no counterpart in
the response:

```xml
<xs:complexType name="PersonProfileDataType">
  <xs:sequence>
    <xs:element name="Profile">
      <xs:complexType>
        <xs:sequence>
          <xs:element name="Name" type="globLib:HumanNameDataType"/>
          ...
```

So `PDPI` contains `Profile`, which contains `Name`, which contains `PrefixName`. The response
is flatter — `principal_investigator.name.prefix` — because `Profile` holds no data of its own.
Something has to introduce that element.

`field_grouping` is the directive for this; its docstring in `conditional_transformers.py` says
"useful when the XSD requires a wrapper element but the JSON has the fields as siblings". It is
the right tool for `Profile`.

The part that does not work is what sits inside. `_process_field_grouping` in
`base_transformer.py` handles a grouped field two ways — a simple value, or a `nested_object`
whose children are simple values:

```python
if transform_type == "nested_object" and isinstance(field_value, dict):
    nested_obj_result = {}
    for child_key, child_config in field_config.items():
        ...
        nested_obj_result[child_target] = field_value[child_key]
```

It assigns rather than recursing, unlike `_apply_transform_rule`, which recurses properly for
`nested_object`. Inside `Profile` that is enough for `Name` and `Address`, and not enough for
the two per-person attachments, which the XSD wraps again:

```xml
<xs:element name="BioSketchsAttached" minOccurs="0">
  <xs:complexType><xs:sequence>
    <xs:element name="BioSketchAttached" type="att:AttachedFileDataType" minOccurs="0"/>
```

An attachment reached through a grouped field therefore has no path through the transformer
today.

## Options

1. **Make `_process_field_grouping` recurse**, the way `_apply_transform_rule` already does for
   `nested_object`. Probably the smaller change and it benefits every form, but it is shared
   machinery under all twenty-odd hand-written mappings, so it needs its own regression pass.
2. **Add a wrapper directive** — an element that emits itself and delegates its children to the
   ordinary recursive path — rather than reusing `field_grouping`, whose contract is "collect
   these siblings" rather than "wrap this subtree".

Option 1 looks right. Option 2 avoids touching a function four forms already depend on.

## Also needed

- `RR_KeyPersonExpanded_4_0-V4.0.xsd` is not in `api/src/services/xml_generation/xsds/`.
  A copy is at
  `grants-form-spec/tests/fixtures/grants-gov-xsd/rr-key-person-expanded-4.0/`, and
  `flask task fetch-xsds --form RR_KeyPersonExpanded_4_0` is the supported way to get it.
- The three tests `xml_generation/README.md` requires of every new form: a deterministic
  fixture, a snapshot equality test, and an `XSDValidator` test.
- An XML parity record, `tests/src/form_schema/parity/xml/diffs/`, once a mapping exists.
  The JSON-schema side needs none: parity compares a generated form against the hand-written
  one it mirrors, and this form has no hand-written counterpart.

## One thing worth checking first

`AdditionalProfilesAttached`, `BioSketchsAttached` and `SupportsAttached` at the root each wrap
a single optional attachment, and the response holds each as one `AttachmentRef`. If
`single_with_wrapper` covers those — the Performance Site mapping uses it for a comparable
shape — then only the per-person attachments inside `Profile` are blocked, and a first mapping
could ship covering everything else, with the two per-person attachments recorded as a known
gap rather than waiting on the transformer change.
