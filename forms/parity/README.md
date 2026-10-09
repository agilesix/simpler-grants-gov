# Form parity

Whether each form's artifacts agree: the form plan (`site/src/content/forms/<slug>.json`),
the Grants.gov DAT and XSD it cites, and the JSON Schema and UI schema compiled from its
TypeSpec (`dist/canonical/forms/<spec_id>/`). It is static analysis: every artifact is
flattened to `{path: field}` and the maps are compared. Nothing is validated or rendered.

## Running it

```bash
npm run compile        # the compiled artifacts under test
npm run test:parity    # fetches any missing sources first, then runs vitest
npm run check:parity   # type-checks the suite
```

## Sources

DATs and XSDs are not committed. `npm run parity:fetch` downloads them from each registered
plan's `dat_url` and `xsd_url`, and every schema those XSDs import, into `.cache/sources/`
(ignored by git). Tests read only that cache and never touch the network.

`sources/sources.lock.json` records each file's SHA-256. A cached file that matches is not
downloaded again, so a warm cache makes the fetch a no-op; CI restores the cache keyed on
the lockfile. If Grants.gov revises a file, the fetch fails rather than silently changing
what the suite compares. Review the revision, then accept it with
`npm run parity:fetch -- --update` and commit the new lockfile.

## What is checked

Each comparison names a subject and runs some of the same seven checks against it:
_has no missing fields_, _has no extra fields_, _matches field order_, _matches field
labels_, _matches field occurrences_, _matches field constraints_ and _matches help text_. Requirements checks ask
whether the plan says what Grants.gov says, so the plan is the subject. Implementation
checks ask whether what we built does what the plan says, so the artifact is the subject.

| Group          | Comparison                 | Subject      | Checks                                                        | Matched by      |
| -------------- | -------------------------- | ------------ | ------------------------------------------------------------- | --------------- |
| Requirements   | plan vs DAT                | plan         | missing, extra, order, labels, occurrences, constraints, help | `dat_field`     |
| Requirements   | plan vs XSD                | plan         | missing, extra, occurrences, constraints                      | `xml_path`      |
| Implementation | plan vs JSON schema        | JSON schema  | missing, extra, occurrences, constraints                      | `json_path`     |
| Implementation | plan vs UI schema          | UI schema    | missing, extra, order, labels, help                           | `json_path`     |
| Implementation | plan vs rules schema       | rules schema | not yet emitted (`it.todo`)                                   |                 |
| Implementation | plan vs XML mapping        | XML mapping  | not yet emitted (`it.todo`)                                   |                 |
| XML            | XML mapping vs JSON schema | XML mapping  | not yet emitted (`it.todo`)                                   |                 |
| XML            | XML mapping vs XSD         | XML mapping  | not yet emitted (`it.todo`)                                   |                 |
| XML            | JSON schema vs XSD         | JSON schema  | occurrences, constraints (the schema may be stricter)         | the plan's link |

Suite checks then confirm the results can be trusted for each form: the plan's text is
readable, the walked JSON schema agrees with the emitter's `index.json`, and every
recorded difference still exists.

Constraints are requiredness plus the keywords each comparison reads (`SPECS` in
`harness/index.ts`). Requiredness is always from the form's root, so a field inside an
optional section is optional. A plan's `Conditional (...)` counts as optional.

The DAT is compared on `maxLength` only. Its minimum is 0 for every optional field and 1
for every required one, so it restates requiredness; the XSD is the authority on
`minLength`. A DAT list shown as a popup is a fixed code list, so its "max chars" is not a
length rule. An exact length is stated in a plan as `minLength 12, maxLength 12`.

The DAT prints `*` before a required field's label. Labels compared with the DAT keep it,
and the plan's label gets one wherever the plan says the field is required, so a label only
differs on the asterisk where the DAT and the plan disagree about requiredness (a DAT `*`
on a field the plan makes conditional, for example).

Occurrences are how many times a field can appear in one form: `max_occurs` on a plan
section (inherited by its fields, which can override it; 1 by default), the DAT's Maximum
Occurrences, the product of `maxOccurs` above an XSD element, and the product of `maxItems`
above a schema field. Only the maximum is compared: the DAT's minimum occurrences restates
requiredness, like its minimum characters.

Everything else is compared for equality, except JSON schema vs XSD: there the compiled
schema must accept nothing the XSD rejects, but may be stricter.

## Adding a form

Write `diffs/<form>.ts` exporting a `FormDiff` whose `slug` is the plan's, and add it to
`DIFFS` in `diffs/index.ts`. The plan needs `dat_url`, `xsd_url`, and fields with
`dat_field`, `json_path` and `xml_path`. A plan without a `spec_id` gets the requirements
checks only; the rest are skipped until the form is compiled. A test fails if a plan with a
`spec_id` is not registered.

## When a check fails

Each failure lists every difference of one kind. For each, either fix the artifact that is
wrong, or record the difference in the form's `diffs/` file. Every entry has a `category`
and a `reason`:

| `category`    | Shown as               | Meaning                                               |
| ------------- | ---------------------- | ----------------------------------------------------- |
| `upstream`    | Upstream discrepancy   | The Grants.gov DAT and XSD disagree.                  |
| `intentional` | Intentional difference | Simpler Grants intentionally differs from Grants.gov. |
| `gap`         | Known gap              | A known gap awaiting a fix.                           |

`renamed` maps a plan path to the artifact's path (`to`) where the two name one field
differently.

A difference in a value (a rule, a label or help text) is recorded with the values it was
accepted at, so it cannot drift unnoticed. Use `null` for a side that states nothing:

```ts
dat: {
  differingRules: {
    "7-01/maxLength": {
      plan: 6,
      source: 4,
      category: "upstream",
      reason: "The DAT says 4; the XSD's type allows 6.",
    },
  },
},
```

If either value later changes, the difference is reported again under its own check, with
what was recorded (`plan 5, source 6; recorded as plan 4, source 6`). A field that is absent
or out of order is recorded by path alone.

A recorded difference that stops being real fails _recorded differences still exist_, so
the record cannot rot.

Every recorded difference is listed on the form's page in the form library, under
Deviations (see `deviations.ts`). Context that cannot be checked goes in the plan's `notes`
instead, which the page shows separately.

## Layout

Read top-down; each layer only imports the ones below it. Unit tests sit beside the module
they cover.

```
forms.test.ts       every check, per registered form -- start here
harness.test.ts     each check, on hand-built fields: does it report what its name says?
diffs/              one record of known differences per form
deviations.ts       the recorded differences as the form library's Deviations tab lists them
sources/
  fetch.ts            the parity:fetch CLI
  sources.lock.json   SHA-256 of every cached Grants.gov file
harness/
  index.ts            checkForm() and SPECS: what each comparison checks
  load.ts             every disk read: plans, compiled artifacts, cached sources
  flatten/            one pure flattener per artifact, each with its own *.test.ts
  compare.ts          comparePair(): the six checks, with recorded differences applied
  model.ts            paths, fields, discrepancies, recorded differences (+ model.test.ts)
```
