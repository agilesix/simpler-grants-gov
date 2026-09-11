# Architecture

How a form gets built here, and why it is built that way.

`README.md` covers the mechanics — the two emitters, the sync step, the commands.
This file covers the model: what a question is, how forms compose them, and what
the compiler produces at the other end.

## Forms are combinations of questions

A form here is not a hand-written JSON schema. It is a list of questions drawn from a
shared bank, and the compiler produces every artifact the application needs from that
one description.

A **question** is a field, or a set of fields, with two halves:

- a **shape** — the data type and JSON schema constraints that say what a valid answer
  looks like
- a **semantic meaning** — what is being asked, and of whom

The second half is what makes a question a question. The applicant organization's
address and the point of contact's address are the same `generics/address` shape —
the same eight members, the same length limits — and on SF-424 they even carry the
same requiredness rules. They are still two different questions, because the answers
mean different things, come from different people, map to different XML elements, and
change independently of one another.

```typespec
// The shape: what an address looks like. Not a question anyone is asked.
model QuestionAddress {
  street1?: string;
  city?: string;
  state?: StateCode;
  country?: CountryCode;
  // ...
}

// A question: the applicant organization's address, wherever it is asked.
@Meta.question(#{ id: "primary-org/address", entity: EntityName.primaryOrg })
@UI.label("Address")
model QuestionPrimaryOrgAddress extends QuestionAddress {}

// Another question, same shape, different meaning: the address of the person to
// contact about this application. It is a member of poc/details rather than a
// question of its own, because a point of contact is asked for as a unit.
model QuestionPocDetails extends QuestionContactDetails {
  address: QuestionAddress;
}
```

Two questions that validate identically are still two questions. Collapsing them
because their schemas agree is how a change to one organization's address rules
quietly reaches the contact's, and how the bank loses the ability to answer "which
forms ask the applicant for an address."

So a form declares which questions it asks and how it presents them — field name,
label, section, requiredness — and the questions themselves are shared:

```typespec
model SF424Short {
  @UI.label("Legal Name")
  organizationName: LegalName;              // primary-org/legal-name

  @UI.label("Address")
  applicant: QuestionPrimaryOrgAddress;     // primary-org/address

  @UI.label("Authorized Representative")
  authorizedRepresentative: QuestionAorName; // aor/name
}
```

Writing the form once rather than writing five artifacts by hand also means the
artifacts cannot disagree with each other — a UI schema pointing at a property the JSON
schema does not define is a compile error rather than a runtime surprise — and a
constraint is declared where the question is. `primary-org/ein` declares `minLength: 9`
once, and every form asking for an EIN inherits it.

## How SGG forms are built with this approach

Every step below happens in `forms/`, except registering the finished form once in the
API tree.

**1. Author or extend the questions.** One file per question in
`specs/question-bank/<entity>/<question>.tsp`, added to that entity's `index.tsp`
barrel. A form that only reuses existing questions skips this step.

**2. Write the form.** `specs/forms/<form>.tsp` declares `@Meta.form`, its sections, and
the questions it asks. Import it from `specs/main.tsp` so one compile covers every form.

**3. Add the XML transform, if the form submits to Grants.gov.** `specs/xml/<form>.json`
is a transcription of the form's Grants.gov XSD, and the one artifact still written by
hand rather than emitted.

**4. Compile and install.**

```bash
npm run emit      # build the emitters, compile specs/main.tsp, then sync
```

That produces, per form:

```
dist/canonical/forms/<form>/   schema.json ui.json index.json manifest.json
dist/sgg/forms/<form>/         ui-schema.json rule-schema.json
```

and `scripts/sync.mjs` installs from them into the API tree, projecting `camelCase` to
`snake_case` and inlining referenced questions into `$defs` along the way:

```
api/src/form_schema/forms/<form>_portable/
  __init__.py       generated; calls load_versioned_form(dir, "1.0")
  config.py         generated; FORM_ID (a UUIDv5 of the spec id) and SHORT_FORM_NAME
  1/0/form.json     scalars -- ids, names, version, agency code, OMB number
  1/0/json_schema.json  ui_schema.json  rule_schema.json  xml_transform.json
```

**5. Register the form once.** Add the import and an `_ALL_FORMS` entry in
`api/src/form_schema/forms/__init__.py`. This is the only hand edit in the API tree, and
only for a form that is new — re-emitting an existing form touches nothing here.

```python
from .key_contacts_portable import FORM as KeyContactsPortable_v1_0
```

**6. The existing infrastructure loads it unchanged.** `_loader.py` reads `form.json`,
folds the four sibling schema documents back in, and returns the same `Form` a
hand-written `form_json.py` produces; `init_form_registry()` then registers every entry
in `_ALL_FORMS` with `form_template_registry`. Nothing downstream — the registry, the
API, the frontend — distinguishes a generated form from a hand-written one.

**7. Guard against drift.** `npm run sync:check` fails when the committed artifacts
differ from a fresh emit, so editing a specification without re-emitting breaks the
build the same way `openapi.generated.yml` does. A form mirroring a hand-written one
also contributes a parity mapping; see below.

## The question bank

One file per question, and the file path mirrors the id — `primary-org/ein.tsp`
holds `primary-org/ein`. A form imports an entity's `index.tsp` barrel or a single
question file.

```typespec
/** Enter either TIN or EIN as assigned by the Internal Revenue Service. */
@Meta.question(#{ id: "primary-org/ein", entity: EntityName.primaryOrg })
@Meta.tag(TagName.identifier, TagName.organization)
@UI.label("EIN/TIN")
@minLength(9)
@maxLength(30)
scalar EmployerIdentificationNumber extends string;
```

The `@Meta.question` id is the question's identity, and the entity says whose answer
it is. Entity questions extend the generic shapes in `generics/` rather than being
them — `generics/person-name` describes what a name looks like, and `aor/name` is a
thing forms ask for:

```typespec
@Meta.question(#{ id: "aor/name", entity: EntityName.authorizedRepresentative })
@UI.label("Authorized Representative")
model QuestionAorName extends QuestionPersonName {}
```

The compiler records which questions each field belongs to in the form's
`index.json`, so the bank can be queried in both directions — every field a question
reaches, and every question a field came from:

```json
{
  "path": "/keyContacts/[]/name/firstName",
  "leaf": true,
  "blockIds": ["generics/contact-details", "generics/person-name", "poc/details"]
}
```

## End to end

Say five questions are needed: an organization's legal name, address and EIN, a
point of contact with a name and address, and an authorized representative's name.

### 1. Author the questions

The generic shapes already exist in `specs/question-bank/generics/`, so the two
entity questions extend them and the three scalars extend either a generic or a
built-in:

```
specs/question-bank/
  generics/
    address.tsp        model QuestionAddress { street1, street2, city, ... }
    person-name.tsp    model QuestionPersonName { prefix, firstName, ... }
    organization-name.tsp
  primary-org/
    legal-name.tsp     scalar LegalName extends OrganizationName
    address.tsp        model QuestionPrimaryOrgAddress extends QuestionAddress
    ein.tsp            scalar EmployerIdentificationNumber extends string
  poc/
    details.tsp        model QuestionPocDetails { name, address, ... }
  aor/
    name.tsp           model QuestionAorName extends QuestionPersonName
```

Constraints that belong to the question go on the question. `primary-org/address`
requires a state and ZIP only when the country is the US, and every form that asks
for it gets that rule:

```typespec
@Meta.question(#{ id: "primary-org/address", entity: EntityName.primaryOrg })
@UI.label("Address")
@Validation.requiredPaths("street1", "city", "country")
@Validation.requiredPathWhen("state", "country", CountryCode.USA)
@Validation.requiredPathWhen("zipCode", "country", CountryCode.USA)
model QuestionPrimaryOrgAddress extends QuestionAddress {}
```

### 2. Compose two forms from the same questions

Each form supplies its own field names, labels, section layout and requiredness.
The questions are unchanged.

```typespec
// specs/forms/org-profile.tsp
@Meta.form(#{ id: "org-profile", formName: "Organization Profile", ... })
@UI.sections(OrgProfileSection)
model OrgProfile {
  @UI.label("Legal Name")
  @UI.section(OrgProfileSection.applicant)
  organizationName: LegalName;

  @UI.label("Address")
  @UI.section(OrgProfileSection.applicant)
  applicant: QuestionPrimaryOrgAddress;

  @UI.label("EIN/TIN")
  @UI.section(OrgProfileSection.applicant)
  employerTaxpayerIdentificationNumber: EmployerIdentificationNumber;

  @UI.label("Authorized Representative")
  @UI.section(OrgProfileSection.authorizedRepresentative)
  @Validation.requiredPaths("firstName", "lastName")
  authorizedRepresentative: QuestionAorName;
}
```

```typespec
// specs/forms/contact-sheet.tsp
@Meta.form(#{ id: "contact-sheet", formName: "Contact Sheet", ... })
@UI.sections(ContactSheetSection)
model ContactSheet {
  // The same question as OrgProfile.organizationName, under the name and label
  // this form uses for it.
  @UI.label("Applicant Organization Name")
  @UI.section(ContactSheetSection.contacts)
  applicantOrganizationName: LegalName;

  @UI.label("Point of Contact")
  @UI.section(ContactSheetSection.contacts)
  primaryContact: QuestionPocDetails;
}
```

A form may also narrow a question it composes — reordering members, or requiring
one the question leaves optional — without forking it:

```typespec
/** A point of contact whose title this form insists on. */
@UI.order(FormContact.name, FormContact.title, FormContact.address)
model FormContact extends QuestionPocDetails {
  @UI.label("Title")
  title: ContactTitle;
}
```

### 3. What the compiler emits

The shared question becomes a `$def`, and each form's property references it and
supplies its own title and description. Two labels, one definition, one set of
constraints:

```jsonc
// org-profile → json_schema.json
"organization_name": {
  "allOf": [{ "$ref": "#/$defs/legal_name" }],
  "title": "Legal Name",
  "description": "Enter the legal name of applicant that will undertake the assistance activity."
}

// contact-sheet → json_schema.json
"applicant_organization_name": {
  "allOf": [{ "$ref": "#/$defs/legal_name" }],
  "title": "Applicant Organization Name",
  "description": "Enter the legal name of the applicant that will undertake the assistance activity."
}

// both → "$defs"
"legal_name": { "type": "string", "minLength": 1, "maxLength": 60 }
```

The UI schema carries structure and points at those properties; field labels come
from the JSON schema titles rather than being repeated:

```jsonc
{ "type": "section", "name": "applicant", "label": "Applicant Information",
  "children": [
    { "type": "field", "definition": "/properties/organization_name" },
    { "type": "field", "definition": "/properties/applicant/properties/street1" }
  ]
}
```

Behavior the registry applies at runtime lands in `rule_schema.json`:

```json
{ "sam_uei": { "gg_pre_population": { "rule": "uei" } },
  "date_received": { "gg_post_population": { "rule": "current_date" } } }
```

### 4. Emit and install

`npm run emit`, then register the two forms in `api/src/form_schema/forms/__init__.py`
as in the steps above. `README.md` covers what the sync step does to the artifacts on
the way in.

## Parity testing

Both suites live in `api/tests/src/form_schema/form_spec/` and ask whether a
generated form agrees with something already trusted.

**Form parity** compares a generated form against the hand-written form it
mirrors. A hand-written mapping in `parity/mappings/<form>.py` claims which fields
on the two sides correspond; the checks then hold that claim to both schemas —
every mapped path exists on both sides, every input on both sides is accounted
for, and corresponding inputs are governed by the same validation rules. The
mapping is deliberately hand-written, because it is an assertion about two forms
that someone should have to defend.

**XML mapping parity** compares a form's `json_to_xml_schema` against the
Grants.gov XSD it targets. The transformer iterates over mapping rules rather than
over the applicant's answers, so a field with no rule silently never reaches the
submission, and most Grants.gov elements are `minOccurs="0"` — the document still
validates. Comparing the mapping to the schema directly surfaces the omission
without needing a fixture that happens to populate the right field.

Both suites record known differences rather than hiding them. A rule difference
where the official Grants.gov schema shows the hand-written form is the one at
fault goes in `upstream_rule_defects` with a citation naming the XSD, and a
companion check fails when an entry stops naming a real input, so the register
cannot rot. `parity/README.md` covers the specifics, including the property-based
check that is deliberately not in the suite.
