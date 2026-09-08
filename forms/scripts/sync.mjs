/**
 * Install emitted artifacts into the API's form tree.
 *
 * The emitters deliberately know nothing about where this application keeps forms --
 * that layout is this repository's convention and has changed once already -- so they
 * write to their own stable output directories and this step installs from there.
 *
 * It also applies the snake_case projection (see naming.mjs) and assembles the three
 * artifacts into the single form.json that _loader.py reads.
 *
 *   node scripts/sync.mjs            write the files
 *   node scripts/sync.mjs --check    fail if what is committed differs (drift gate)
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projectRuleSchema, projectSchema, projectUiSchema, toSggName } from "./naming.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalDir = resolve(root, "dist/canonical/forms");
const sggDir = resolve(root, "dist/sgg/forms");
const apiFormsDir = resolve(root, "../api/src/form_schema/forms");
const check = process.argv.includes("--check");

/**
 * A stable UUID per form, derived from its specification id so it is reproducible
 * without a registry of assigned identifiers. Version 5 over a fixed namespace, which
 * is how a name-based UUID is meant to be produced.
 */
const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // RFC 4122 DNS namespace
function uuid5(name) {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(Buffer.concat([ns, Buffer.from(name, "utf8")])).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const h = hash.subarray(0, 16).toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

/**
 * Move a `$ref`'s siblings inside an `allOf`, so resolution cannot discard them.
 *
 * `{$ref, title, required}` is valid 2020-12 and means "that schema, plus these", but
 * jsonref -- which the registry resolves with -- returns only the referenced schema and
 * drops everything beside it. A form composing a question and then adding to it therefore
 * loses the addition: a label, a read-only flag, a tighter maxLength, or the requiredness
 * a form declares over a shared question's members.
 *
 * `{allOf: [{$ref}], title, required}` says the same thing and survives, which is why the
 * hand-written forms are shaped that way.
 */
function wrapRefSiblings(node) {
  if (Array.isArray(node)) return node.map(wrapRefSiblings);
  if (node === null || typeof node !== "object") return node;

  const walked = Object.fromEntries(
    Object.entries(node).map(([k, v]) => [k, wrapRefSiblings(v)]),
  );
  const { $ref, ...siblings } = walked;
  if ($ref === undefined || Object.keys(siblings).length === 0) return walked;

  // An existing allOf keeps its branches; the ref joins them.
  const { allOf = [], ...rest } = siblings;
  return { allOf: [{ $ref }, ...allOf], ...rest };
}

/**
 * Inline every question a form references, so the form.json stands alone.
 *
 * The canonical schema points at sibling question files -- a relative $ref such as
 * `../../question-bank/budget/activity-title/schema.json` -- because a question is a
 * published artifact with its own identity. The registry resolves refs with jsonref at
 * registration and cannot follow a relative file path, and the hand-written forms are
 * self-contained for the same reason, so each referenced question is pulled into $defs
 * and the ref rewritten to point there.
 *
 * Questions reference other questions, so this recurses; a question already inlined is
 * reused rather than duplicated.
 */
async function bundle(schema, formDir) {
  const defs = {};
  const keyByRef = new Map();

  const keyFor = (ref) => {
    // ".../question-bank/budget/activity-title/schema.json" -> "activity_title"
    const parts = ref.replace(/\/schema\.json$/, "").split("/");
    let key = toSggName(parts[parts.length - 1].replace(/-/g, "_"));
    let n = 2;
    while (keyByRef.has(key) && keyByRef.get(key) !== ref) key = `${toSggName(parts[parts.length - 1].replace(/-/g, "_"))}_${n++}`;
    return key;
  };

  const walk = async (node, baseDir) => {
    if (Array.isArray(node)) return Promise.all(node.map((n) => walk(n, baseDir)));
    if (node === null || typeof node !== "object") return node;

    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "$ref" && typeof v === "string" && !v.startsWith("#")) {
        const target = resolve(baseDir, v);
        const key = keyFor(v);
        if (!(key in defs)) {
          keyByRef.set(key, v);
          defs[key] = null; // reserve before recursing, so a cycle terminates
          const referenced = await readJson(target);
          const { $schema, $id, $defs: nested, ...body } = referenced;
          // A question carries its own $defs -- a shared enum such as StateCode. Those
          // are hoisted to the form's $defs, because the internal `#/$defs/...` pointers
          // in the inlined body resolve against the document root, which is now the form.
          for (const [nestedKey, nestedSchema] of Object.entries(nested ?? {})) {
            if (!(nestedKey in defs)) {
              defs[nestedKey] = null;
              defs[nestedKey] = await walk(nestedSchema, dirname(target));
            }
          }
          defs[key] = await walk(body, dirname(target));
        }
        out.$ref = `#/$defs/${key}`;
      } else {
        out[k] = await walk(v, baseDir);
      }
    }
    return out;
  };

  const { $schema, $id, $defs: existing, ...body } = schema;
  const bundled = await walk(body, formDir);
  // The emitter's own $defs hold inlined local declarations, and those carry refs to
  // published questions too, so they are walked rather than merged through untouched.
  const walkedExisting = existing ? await walk(existing, formDir) : {};
  const merged = { ...walkedExisting, ...defs };
  return wrapRefSiblings({
    ...($schema ? { $schema } : {}),
    ...bundled,
    ...(Object.keys(merged).length ? { $defs: merged } : {}),
  });
}

async function buildForm(id) {
  const manifest = await readJson(resolve(canonicalDir, id, "manifest.json"));
  const schema = await bundle(
    await readJson(resolve(canonicalDir, id, "schema.json")),
    resolve(canonicalDir, id),
  );
  const uiSchema = await readJson(resolve(sggDir, id, "ui-schema.json"));

  let ruleSchema = null;
  try {
    ruleSchema = await readJson(resolve(sggDir, id, "rule-schema.json"));
  } catch {
    // A form with no rules emits null; nothing to project.
  }

  const m = manifest.form;
  const form = {
    form_id: uuid5(`simpler-forms:${m.id}`),
    form_name: m.formName,
    short_form_name: m.shortFormName,
    form_version: m.formVersion,
    form_json_schema: projectSchema(schema),
    form_ui_schema: projectUiSchema(uiSchema),
  };
  if (m.agencyCode) form.agency_code = m.agencyCode;
  if (m.ombNumber) form.omb_number = m.ombNumber;
  if (m.legacyFormId !== undefined) form.legacy_form_id = m.legacyFormId;
  if (ruleSchema) form.form_rule_schema = projectRuleSchema(ruleSchema);
  // A parallel directory, so a specification-authored form registers alongside the
  // hand-written one it mirrors instead of replacing it. Both appear in the registry
  // with distinct ids, which is what makes a side-by-side comparison possible.
  const dirName = `${toSggName(m.id.replace(/-/g, "_"))}_portable`;
  return { form, dirName, major: 1, minor: 0 };
}

const ids = (await readdir(canonicalDir, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

let drifted = 0;
for (const id of ids) {
  const { form, dirName, major, minor } = await buildForm(id);
  const dir = resolve(apiFormsDir, dirName, String(major), String(minor));
  const path = resolve(dir, "form.json");
  const content = `${JSON.stringify(form, null, 2)}\n`;

  if (check) {
    let existing = null;
    try {
      existing = await readFile(path, "utf8");
    } catch {
      /* missing counts as drift */
    }
    if (existing !== content) {
      console.error(`drift: ${dirName}/${major}/${minor}/form.json differs from the emitted artifacts`);
      drifted += 1;
    }
    continue;
  }

  await mkdir(dir, { recursive: true });
  await writeFile(path, content);

  // The two Python files every form directory carries. Generated rather than
  // hand-written because both are fully determined by the specification, and
  // test_form_structure.py requires them.
  const pkgDir = resolve(apiFormsDir, dirName);
  await writeFile(
    resolve(pkgDir, "config.py"),
    [
      "import uuid",
      "",
      "# Generated by forms/scripts/sync.mjs. Do not edit.",
      "# Stable identifiers for this form -- do not change across versions.",
      `FORM_ID = uuid.UUID("${form.form_id}")`,
      `SHORT_FORM_NAME = "${form.short_form_name}"`,
      "",
    ].join("\n"),
  );
  await writeFile(
    resolve(pkgDir, "__init__.py"),
    [
      "# Generated by forms/scripts/sync.mjs. Do not edit.",
      "from pathlib import Path",
      "",
      "from src.form_schema.forms._loader import load_versioned_form",
      "",
      `_mod = load_versioned_form(Path(__file__).parent, "${major}.${minor}")`,
      "FORM_JSON_SCHEMA = _mod.FORM_JSON_SCHEMA",
      "FORM_UI_SCHEMA = _mod.FORM_UI_SCHEMA",
      "FORM_RULE_SCHEMA = _mod.FORM_RULE_SCHEMA",
      "FORM_XML_TRANSFORM_RULES = _mod.FORM_XML_TRANSFORM_RULES",
      "FORM = _mod.FORM",
      "del _mod",
      "",
    ].join("\n"),
  );
  console.log(`  ${dirName}/  form.json + config.py + __init__.py  (${form.form_id})`);
}

if (check && drifted) {
  console.error(`\n${drifted} form(s) out of date. Run \`npm run sync\` and commit the result.`);
  process.exit(1);
}
if (check) console.log("all forms match the emitted artifacts");
