/**
 * Every disk read the harness makes. The flatteners take what these return and never touch
 * the file system themselves.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { dereference } from "@apidevtools/json-schema-ref-parser";

import type { Plan } from "./flatten/plan.ts";
import type { Json } from "./model.ts";

// ---------------------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------------------

/** `forms/`, whatever directory the suite runs from. */
export const FORMS_ROOT = fileURLToPath(new URL("../../", import.meta.url));

const PLANS_DIR = path.join(FORMS_ROOT, "site", "src", "content", "forms");
const CANONICAL_DIR = path.join(FORMS_ROOT, "dist", "canonical");
const CACHE_DIR = path.join(FORMS_ROOT, ".cache", "sources");
export const LOCK_FILE = path.join(
  FORMS_ROOT,
  "parity",
  "sources",
  "sources.lock.json",
);

// ---------------------------------------------------------------------------------------
// Form plans
// ---------------------------------------------------------------------------------------

/** Every plan in `site/src/content/forms/`, by slug. */
export function loadPlans(): Map<string, Plan> {
  return new Map(
    readdirSync(PLANS_DIR)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const plan = JSON.parse(
          readFileSync(path.join(PLANS_DIR, name), "utf8"),
        ) as Plan;
        return [plan.slug, plan];
      }),
  );
}

// ---------------------------------------------------------------------------------------
// Compiled form artifacts (`npm run compile`)
// ---------------------------------------------------------------------------------------

const formFile = (specId: string, name: string) =>
  path.join(CANONICAL_DIR, "forms", specId, name);

const readJson = (file: string) =>
  JSON.parse(readFileSync(file, "utf8")) as Json;

/**
 * Reads each schema file without its top-level `$id`, as `loadFormSpec` in
 * `site/src/lib/formSpec.ts` does: the emitter's `$id`s are relative to a hosting base, so
 * resolving against them would re-base the relative `$ref`s.
 */
const fileWithoutId = {
  order: 1,
  canRead: (file: { url: string }) => !/^https?:/.test(file.url),
  read: (file: { url: string }) => {
    const schema = readJson(
      file.url.startsWith("file:") ? fileURLToPath(file.url) : file.url,
    );
    delete schema.$id;
    return JSON.stringify(schema);
  },
};

/** The form's `schema.json` with every `$ref` inlined. */
export async function loadFormSchema(specId: string): Promise<Json> {
  return (await dereference(formFile(specId, "schema.json"), {
    resolve: { file: fileWithoutId, http: false },
  })) as Json;
}

export const loadUiSchema = (specId: string): Json =>
  readJson(formFile(specId, "ui.json"));

export const loadIndex = (specId: string): Json =>
  readJson(formFile(specId, "index.json"));

// ---------------------------------------------------------------------------------------
// Grants.gov sources (`npm run parity:fetch`)
// ---------------------------------------------------------------------------------------

/** Where `parity/sources/fetch.ts` caches a URL: `.cache/sources/<host>/<path>`. */
export const cachePath = (url: string): string => {
  const { host, pathname } = new URL(url);
  return path.join(CACHE_DIR, host, ...pathname.split("/").filter(Boolean));
};

/** A cached source's bytes. Throws, naming the command to run, if it was never fetched. */
export function readSource(url: string): Buffer {
  const file = cachePath(url);
  if (!existsSync(file))
    throw new Error(
      `${url} is not cached; run \`npm run parity:fetch\` in forms/`,
    );
  return readFileSync(file);
}
