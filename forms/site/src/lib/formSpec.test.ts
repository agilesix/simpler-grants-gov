import type { JsonSchema } from "@jsonforms/core";
import { processFormSchema } from "@sgg/frontend/utils/applyForm/applyFormUtils";
import { beforeAll, describe, expect, it } from "vitest";

import { unadaptableScopes } from "../vendor/sgg/jsonFormsUiSchema";
import { loadFormSpec, type FormSpec } from "./formSpec";
import { createAjv } from "./validation";

type UiNode = {
  type: string;
  scope?: string;
  label?: string;
  elements?: UiNode[];
  options?: { detail?: UiNode };
};

const resolveScope = (schema: JsonSchema, scope: string) =>
  scope
    .slice(2)
    .split("/")
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown>)?.[key],
      schema,
    ) as JsonSchema | undefined;

/** Every Control scope in the tree, paired with the schema it is relative to. */
const controls = (node: UiNode, schema: JsonSchema): [string, JsonSchema][] => {
  const own: [string, JsonSchema][] = node.scope ? [[node.scope, schema]] : [];
  const detail = node.options?.detail;
  const items =
    node.scope && (resolveScope(schema, node.scope)?.items as JsonSchema);
  return [
    ...own,
    ...(detail && items ? controls(detail, items) : []),
    ...(node.elements ?? []).flatMap((child) => controls(child, schema)),
  ];
};

const groupLabels = (node: UiNode): string[] => [
  ...(node.type === "Group" && node.label ? [node.label] : []),
  ...(node.elements ?? []).flatMap(groupLabels),
];

const clone = <T>(value: T): T => structuredClone(value);

describe.each(["key-contacts", "epa-key-contacts"])(
  "loadFormSpec(%s)",
  (specId) => {
    let spec: FormSpec;
    beforeAll(async () => {
      spec = await loadFormSpec(specId);
    });

    it("inlines every $ref", () => {
      expect(JSON.stringify(spec.schema)).not.toContain('"$ref"');
    });

    it("resolves every UI scope against the schema", () => {
      const found = controls(spec.uischema as unknown as UiNode, spec.schema);
      expect(found.length).toBeGreaterThan(0);
      for (const [scope, schema] of found) {
        expect(resolveScope(schema, scope), scope).toBeDefined();
      }
    });

    it("draws every control with an SGG widget", () => {
      const { formSchema } = processFormSchema(spec.schema);
      expect(unadaptableScopes(spec.uischema, formSchema)).toEqual([]);
    });

    it("has an example from the TypeSpec that passes validation", () => {
      expect(spec.example).toBeDefined();
      const validate = createAjv().compile(spec.schema);
      expect(validate(spec.example), JSON.stringify(validate.errors)).toBe(
        true,
      );
    });
  },
);

describe("validation rules", () => {
  it("requires state and zip code for a US address", async () => {
    const { schema, example } = await loadFormSpec("key-contacts");
    const data = clone(example) as {
      keyContacts: { address: Record<string, string> }[];
    };
    delete data.keyContacts[0].address.state;
    const validate = createAjv().compile(schema);
    expect(validate(data)).toBe(false);
    expect(validate.errors).toContainEqual(
      expect.objectContaining({
        instancePath: "/keyContacts/0/address",
        params: { missingProperty: "state" },
      }),
    );
  });

  it("requires a key contact's email", async () => {
    const { schema, example } = await loadFormSpec("key-contacts");
    const data = clone(example) as {
      keyContacts: { contact: Record<string, string> }[];
    };
    delete data.keyContacts[0].contact.email;
    expect(createAjv().compile(schema)(data)).toBe(false);
  });

  it("does not require an EPA contact's email", async () => {
    const { schema, example } = await loadFormSpec("epa-key-contacts");
    const data = clone(example) as {
      payee: { contact: Record<string, string> };
    };
    expect(data.payee.contact.email).toBeUndefined();
    expect(createAjv().compile(schema)(data)).toBe(true);
  });
});

describe("UI layout", () => {
  it("lays out each key contacts entry with the item question's UI", async () => {
    const { uischema } = await loadFormSpec("key-contacts");
    const list = (uischema as unknown as UiNode).elements?.find(
      (el) => el.scope === "#/properties/keyContacts",
    );
    expect(list?.options?.detail?.label).toBe("Key Contact");
  });
});

describe("UI workarounds for simpler-forms 0.1.0-alpha.1", () => {
  it("labels each EPA role group with its property title", async () => {
    const { uischema } = await loadFormSpec("epa-key-contacts");
    expect(groupLabels(uischema as unknown as UiNode)).toEqual(
      expect.arrayContaining([
        "Authorized Representative",
        "Payee",
        "Administrative Contact",
        "Project Manager",
      ]),
    );
  });
});
