# forms

Form specifications, and the emitter that turns them into the artifacts this
application's form registry consumes.

## Why there are two emitters

A specification is written once and compiled by two emitters against the same program:

| Emitter | Writes | Consumed by |
|---|---|---|
| `simpler-forms` | `schema.json`, `ui.json`, `index.json`, `manifest.json` | nothing at runtime — committed as evidence that the specification is not specific to this application |
| `simpler-forms-sgg` | `ui-schema.json`, `rule-schema.json` | the form registry, via `api/src/form_schema/` |

`simpler-forms` holds no vocabulary specific to this application. Everything that is —
`@Sgg.prePopulate`, `@Sgg.multiField`, `@Sgg.fieldList`, the `gg_pre_population` rule
names, and the two emitters that produce this application's shapes — lives in
`emitters/sgg/`.

That separation is a plain TypeSpec library rather than a plugin interface. The compiler
already supports listing several libraries in `tspconfig.yaml`, each contributing its own
decorators, diagnostics, state and emitter, so a plugin mechanism in `simpler-forms`
would duplicate something that exists. It also keeps the dependency one-directional:
`emitters/sgg` reads `simpler-forms`' public API, and `simpler-forms` knows nothing about
this application.

## Layout

```
forms/
  specs/                  form specifications and the shared question bank
  scripts/naming.mjs      camelCase -> snake_case projection
  scripts/sync.mjs        bundles refs, assembles form.json, installs it
  emitters/sgg/
    lib/main.tsp            the @Sgg.* vocabulary and SggPrePop
    src/lib.ts              diagnostics and state keys
    src/decorators.ts       @Sgg.* implementations
    src/model.ts            typed reads of that state
    src/ui-schema.ts        -> ui-schema.json
    src/rules.ts            -> rule-schema.json
    src/validate.ts         keeps @Sgg.* out of the question bank
    src/emitter.ts          $onEmit
  tspconfig.yaml          registers both emitters
```

## Working on it

```bash
npm install
npm run build        # compile both emitter packages
npm run emit         # build, compile specs/, then sync into the API tree
npm run sync         # sync only, from artifacts already emitted
npm run sync:check   # fail if what is committed differs from the artifacts
npm run checks       # build and type-check
```

## What the sync step does, and why it exists

The emitters know nothing about where this application keeps forms. That layout is this
repository's convention, it changed once already this year, and encoding it into a
published package would make a directory move here a breaking change there. So the
emitters write to their own output directories and `scripts/sync.mjs` installs from
them, doing three things the artifacts cannot do for themselves.

**It projects names.** A specification names a field the way the question does —
`activityLineItems`. This application names it `activity_line_items`, because stored
`application_response` rows are keyed that way, the `Budget424aSection` components
hardcode those literals, and `json_to_xml_schema` paths use them. Renaming the stored
data is a production migration, so the projection happens here, applied at the three
places a field name appears: schema property keys, UI schema pointers, and rule keys.

**It bundles.** The canonical schema refers to each question by a relative file path,
because a question is a published artifact with its own identity. The registry resolves
refs with `jsonref` at registration and cannot follow a relative path, so every
referenced question is inlined into `$defs` — including the `$defs` a question carries
of its own, such as a shared `StateCode` enum, which are hoisted so their internal
pointers still resolve.

**It assembles.** The three artifacts become the single `form.json` that `_loader.py`
reads, with `config.py` and `__init__.py` generated alongside because both are fully
determined by the specification and `test_form_structure.py` requires them.

`sync:check` is the drift gate: edit a specification without re-emitting and it fails,
the same shape as the existing `openapi.generated.yml` check.

## Specifications

A form lives in `specs/forms/`. The shared question bank is `specs/question-bank/`,
one directory per entity and one file per question, so a file path mirrors the question
id -- `poc/project-role.tsp` holds `poc/project-role`. A form may import an entity's
`index.tsp` barrel or a single question file.

A form registers as `<name>_portable` beside the hand-written form it mirrors, with a
distinct id, so both can be attached to competitions and compared in one environment.


Do not declare an absolute base with `@jsonSchema("<uri>")` unless you mean the emitted
`$id` and every `$ref` to be absolute. Both work; the relative form is what the
registry expects.

## Before this can merge

**`simpler-forms` is referenced by local path.** Both `package.json` files point at
`file:../../../form-spec`, which compiles on a machine that has both repositories
checked out side by side and nowhere else. It has to become a version from a registry,
or a git reference, before this workspace can build in CI.

That is the one blocker. Everything else here builds and runs: `npm run emit` compiles
the smoke specification through both emitters and writes both sets of artifacts.

**A second Node workspace needs its own CI job.** This repository has one Node project
today, in `frontend/`. Committed generated artifacts also need a drift gate, so that
editing a specification without re-emitting fails the build — the same shape as the
existing `openapi.generated.yml` check.

**npm, not pnpm**, matching `2023-07-20-fe-use-npm`.
