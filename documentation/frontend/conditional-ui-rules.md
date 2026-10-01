# Conditional UI rules

A form specification can say when a field is enabled, disabled, read-only or hidden. The
emitted UI schema carries those rules. This renderer does not act on them.

This page says what the rules are, what the renderer does with them today, what it would cost
to honor them, and how that compares to replacing the renderer with JSON Forms.

## What the rules look like

`generics/address` is the clearest case, and it reaches every form that asks for an address.
`globLib:AddressDataTypeV3` in `GlobalLibrary-V2.0.xsd` puts State and Province in an
`xs:choice`:

```xml
<xs:choice>
  <xs:element name="State"    type="codes:StateCodeDataTypeV3" minOccurs="0"/>
  <xs:element name="Province" type="globLib:ProvinceDataType"  minOccurs="0"/>
</xs:choice>
```

They are alternatives. An address carrying both cannot be represented on the wire. The mined
source records for the forms using this type say the same thing twice — State is "active if
Country is US, inactive otherwise", Province is "inactive if Country is US, active otherwise"
— so the specification states it once, on the question:

```typespec
@UI.label("State")
@UI.enabledWhen(QuestionAddress.country, CountryCode.USA)
state?: StateCode;

@UI.label("Province")
@UI.disabledWhen(QuestionAddress.country, CountryCode.USA)
province?: string;
```

The SGG emitter writes that onto every node the rule governs:

```json
{
  "type": "field",
  "definition": "/properties/keyContacts/items/properties/address/properties/province",
  "conditional": {
    "when": {
      "op": "notEquals",
      "ref": { "scope": "item", "pointer": "/address/country" },
      "value": "USA: UNITED STATES"
    },
    "then": { "interaction": "enabled" },
    "otherwise": { "interaction": "disabled" }
  }
}
```

The full predicate vocabulary is five operators — `equals`, `notEquals`, `in`, `countAtLeast`,
`present` — plus a flat `any` disjunction, and three outcomes: `visible`, `interaction:
enabled | disabled`, and `interaction: readOnly`.

## What the renderer does with them

Nothing. Every field renders as though its rule were absent.

They are allowed through rather than rejected. `additionalProperties: false` on the node types
in `validateUiSchema.ts` made an unread key fatal: `getFormData` returns `TopLevelError` and the
applicant gets an error page instead of a form, so shipping a rule ahead of renderer support
would take the form down rather than degrade it. The node types now accept unknown **object**
properties (`additionalProperties: RULE_EXTENSION`), which admits any future rule while still
catching a mistyped `label` or `widget`, because every scalar key of a node is known.

`unimplementedRuleKeys` reports which rules a UI schema carries that the renderer ignores, and
`getFormData` logs them once per form load:

```
Form <id> declares UI rules this renderer does not implement: conditional.
The fields they govern render unconditionally.
```

### What that costs today

Every form that asks for an address lets an applicant fill in both State and Province, and
`AddressDataTypeV3` cannot hold both. This is not new — the hand-written forms have always
rendered both fields unconditionally, and `key_contacts/1/0/form_json.py` says so deliberately.
What is new is that the specification now states the rule, so the gap is visible.

The XML generation tests do not currently cover it: `_MINIMAL_CONTACT` in
`test_key_contacts_xml_generation.py` is a US address with no `province` key and
`_INTL_CONTACT` is a French address with no `state`, so `test_us_address_omits_province` proves
only that the transform invents nothing. A payload carrying both is worth adding, against
`XSDValidator`, before deciding how much the rules matter.

Three other rules ride along on the two forms added most recently:

| Rule | Ignored effect |
| --- | --- |
| `otherProjectRole` enabled only for the two Other roles | free text ships beside `Faculty` |
| overflow attachments enabled at 99 entries | an overflow file attaches with two people listed |
| `state` enabled only for a US address | a non-US address can carry a US state |

## What honoring them would cost

Roughly 250–350 lines across four places, most of it mechanical:

| Work | Size |
| --- | --- |
| Predicate evaluator — five operators plus `any`, `root` and `item` scope | ~80 lines |
| Resolve `item` scope against the enclosing `FieldList` entry | ~40 lines |
| Thread `disabled` / `readOnly` / `visible` through `getFieldConfig` and `FieldListWidget` | ~60 lines |
| Re-evaluate on change, and decide what happens to a value when its field turns off | ~40 lines |
| Tests | ~100 lines |

The widgets need no work. `UswdsWidgetProps` already carries `disabled`, `readOnly` and
`isFormLocked`, `FieldListWidget` already passes all three to its children, and `renderWidget`
already honors `isFormLocked`. The missing piece is deciding the values, not applying them.

Two decisions are not mechanical:

- **`item` scope.** Every address rule is relative to the enclosing list entry — Province is
  governed by *its own* entry's Country, not the first entry's. `FieldListWidget` holds entry
  values in `entryValue`, so the data is there, but nothing currently resolves a pointer
  against it.
- **What happens to the value.** Read-only retains what is there; disabling should clear it.
  If a user types a Province and then switches Country to the US, retaining freezes a stale
  Province into a submission that `xs:choice` forbids. The mined evidence flags exactly this:
  the source says *inactive*, and whether an existing value must be cleared "is not encoded".
  Clearing is the behavior that satisfies the XSD, and it is a product decision, not a
  rendering one.

There is also a question this raises that has nothing to do with which renderer is used: an
empty `country` disables State, so a fresh form opens with State greyed out. Faithful to the
source, probably wrong for an applicant. Someone has to choose a starting state.

## How that compares to JSON Forms

The canonical emitter already produces JSON Forms. `dist/canonical/**/ui.json` is not an
SGG-shaped artifact that would need translating — it is a JSON Forms UI schema, rules included:

```json
{
  "type": "Control",
  "scope": "#/properties/province",
  "label": "Province",
  "rule": {
    "effect": "ENABLE",
    "condition": {
      "scope": "#/properties/country",
      "schema": { "not": { "const": "USA: UNITED STATES" } }
    }
  }
}
```

So the comparison is not "write an evaluator" against "write an adapter". It is "write an
evaluator" against "consume an artifact that already exists".

**What maps cleanly.** JSON Forms conditions are JSON Schema, which covers four of the five
operators without inventing anything: `equals` is `const`, `notEquals` is `not: { const }`,
`in` is `enum`, `countAtLeast` is `minItems` scoped at the array. `any` is a composable `OR`
condition. `visible` is `SHOW`/`HIDE` and `interaction: enabled | disabled` is
`ENABLE`/`DISABLE`.

**What does not.**

- `interaction: readOnly` has no rule effect. JSON Forms' effects are HIDE, SHOW, DISABLE and
  ENABLE; read-only is a static uischema option. Nothing currently emits `readOnly` as a rule —
  `@UI.readOnlyWhen` has no remaining uses now that `@UI.disabledWhen` exists — so this is a
  constraint on what may be specified later, not a present gap.
- **Item-relative scope is the same problem in both worlds.** JSON Forms rules resolve against
  the root, and sibling-relative scope inside array items is its known rough edge. Every
  address rule is item-scoped, so this is the main case rather than a corner. Whichever
  renderer runs, someone writes this.

**The real difference is everything that is not rules.** A renderer swap also has to carry
`FieldList` (662 lines), the six SF-424A budget components, `Table`, the two attachment
widgets, print views, the warning-rebasing on entry delete, and the USWDS styling of all of it
— about 5,600 lines of widgets on top of ~2,500 lines of form engine, none of which JSON Forms
supplies. It is worth noting that SGG depends on `@rjsf/utils` only, not `@rjsf/core`: the
render loop is already hand-written, and RJSF is being used for its types and helpers.

So the honest framing for a decision:

- **Honoring the rules in the current renderer** is a contained, well-scoped change. The two
  hard parts — item scope, and what happens to a disabled value — are hard in either renderer.
- **Switching to JSON Forms** would get rules, and the rules are already emitted for it. It
  would not get the twelve custom widgets, and those are where the bulk of the code is.

The two are not alternatives on the same scale. Honoring `conditional` is a sprint;
re-platforming the renderer is a quarter, and it should be argued on the widget inventory and
the cost of maintaining a bespoke form engine, not on conditional rules — which are the
cheapest thing on either list.

## Adding a rule the renderer does not implement

Emit it. `validateUiSchema` accepts any object-valued property on a `field`, `multiField` or
`fieldList` node, so a new rule ships without touching the frontend, and
`unimplementedRuleKeys` starts naming it in the console. When the renderer learns to act on it,
add its key to `IMPLEMENTED_NODE_KEYS` so it stops being reported.
