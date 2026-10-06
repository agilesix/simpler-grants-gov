/**
 * Build-time loader for the canonical form artifacts emitted by `forms/` (`npm run compile`).
 *
 * The emitter writes one `schema.json` per question with relative cross-file `$ref`s, and a
 * JSON Forms `ui.json` per form. JSON Forms needs a self-contained schema, so the form's
 * schema is dereferenced here; its `examples` come straight from `@example` in the TypeSpec.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dereference } from "@apidevtools/json-schema-ref-parser";
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";

/** `forms/` — the site runs from `forms/site`. */
const FORMS_ROOT = path.resolve(process.cwd(), "..");
export const CANONICAL_DIR = path.join(FORMS_ROOT, "dist", "canonical");

export interface FormSpec {
  schema: JsonSchema;
  uischema: UISchemaElement;
  /** The first `@example` declared on the form model, if any. */
  example?: Record<string, unknown>;
}

type UiNode = {
  type: string;
  scope?: string;
  label?: string;
  elements?: UiNode[];
  options?: Record<string, unknown>;
};

const readJson = async (file: string) =>
  JSON.parse(await readFile(file, "utf8")) as Record<string, unknown>;

/** Split `#/properties/a/properties/b` into its property names, or undefined. */
const scopeProps = (scope: string): string[] | undefined => {
  if (!scope.startsWith("#/properties/")) return undefined;
  const tokens = scope.slice(2).split("/");
  const props: string[] = [];
  for (let i = 0; i < tokens.length; i += 2) {
    if (tokens[i] !== "properties" || !tokens[i + 1]) return undefined;
    props.push(tokens[i + 1]);
  }
  return props;
};

const schemaAt = (schema: JsonSchema, props: string[]) =>
  props.reduce<JsonSchema | undefined>(
    (node, prop) => node?.properties?.[prop],
    schema,
  );

const controlScopes = (node: UiNode): string[] =>
  node.scope
    ? [node.scope]
    : (node.elements ?? []).flatMap((child) => controlScopes(child));

/**
 * Workaround for simpler-forms 0.1.0-alpha.1: a nested question's Group takes the question's
 * label ("Contact Person") rather than the property's ("Payee"). Relabel a Group with the
 * `title` of the property all of its controls sit under, when that is deeper than its parent's.
 *
 * TODO: remove once https://github.com/agilesix/simpler-forms/issues/7 is released.
 */
const labelGroups = (
  node: UiNode,
  schema: JsonSchema,
  parentDepth = 0,
): UiNode => {
  const out: UiNode = { ...node };
  let depth = parentDepth;
  if (node.type === "Group") {
    const scopes = controlScopes(node).map(scopeProps);
    if (scopes.length && scopes.every(Boolean)) {
      const paths = scopes as string[][];
      const common: string[] = [];
      for (
        let i = 0;
        paths.every((p) => p.length > i + 1 && p[i] === paths[0][i]);
        i++
      ) {
        common.push(paths[0][i]);
      }
      if (common.length > parentDepth) {
        const title = schemaAt(schema, common)?.title;
        if (title) out.label = title;
        depth = common.length;
      }
    }
  }
  if (node.elements) {
    out.elements = node.elements.map((child) =>
      labelGroups(child, schema, depth),
    );
  }
  return out;
};

/**
 * Drop every `$id` and nested `$schema` once refs are inlined: a shared question appears at
 * several places in the tree, and Ajv rejects one `$id` resolving to more than one schema.
 *
 * TODO: drop the `$id` handling once https://github.com/agilesix/simpler-forms/issues/8 is released.
 */
const stripIds = (node: unknown, root = true): unknown => {
  if (Array.isArray(node)) return node.map((child) => stripIds(child, false));
  if (!node || typeof node !== "object") return node;
  return Object.fromEntries(
    Object.entries(node)
      .filter(([key]) => key !== "$id" && (root || key !== "$schema"))
      .map(([key, value]) => [key, stripIds(value, false)]),
  );
};

/**
 * Read each schema file without its top-level `$id`. The emitter's `$id`s are relative to a
 * hosting base supplied at publish time, so resolving them against the file's own path would
 * re-base its relative `$ref`s; the `$ref`s are written relative to the file location.
 *
 * TODO: remove once https://github.com/agilesix/simpler-forms/issues/8 is released.
 */
const fileWithoutId = {
  order: 1,
  canRead: (file: { url: string }) => !/^https?:/.test(file.url),
  read: async (file: { url: string }) => {
    const filePath = file.url.startsWith("file:")
      ? fileURLToPath(file.url)
      : file.url;
    const schema = await readJson(filePath);
    delete schema.$id;
    return JSON.stringify(schema);
  },
};

export async function loadFormSpec(specId: string): Promise<FormSpec> {
  const formDir = path.join(CANONICAL_DIR, "forms", specId);
  const schemaFile = path.join(formDir, "schema.json");
  // Copying also unshares the objects dereferencing reuses between `$ref` targets, since the
  // result is handed to a client island as props.
  const resolved = await dereference(schemaFile, {
    resolve: { file: fileWithoutId, http: false },
  });
  const schema = stripIds(resolved) as JsonSchema & {
    examples?: Record<string, unknown>[];
  };
  const ui = (await readJson(path.join(formDir, "ui.json"))) as UiNode;
  const uischema = labelGroups(ui, schema) as UISchemaElement;
  return { schema, uischema, example: schema.examples?.[0] };
}
