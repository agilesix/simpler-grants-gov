import type { DecoratorContext, Model, ModelProperty, Type, Value } from "@typespec/compiler";
import { serializeValueAsJson } from "@typespec/compiler";
import { stateKeys } from "./lib.js";

type Ctx = DecoratorContext;

/**
 * `valueof <Model>` arrives as a TypeSpec ObjectValue with parent back-references, so it
 * cannot be serialized directly. Convert to plain JS at the boundary.
 */
function plain(ctx: Ctx, value: unknown): unknown {
  const v = value as Value;
  if (v && typeof v === "object" && "entityKind" in v && (v as any).entityKind === "Value") {
    return serializeValueAsJson(ctx.program, v, (v as any).type);
  }
  return value;
}

/** Peel one layer of TypeSpec value wrapping. */
function unwrap(v: unknown): unknown {
  const o = v as any;
  if (o && typeof o === "object" && "entityKind" in o && o.entityKind === "Value" && "value" in o) {
    return o.value;
  }
  return v;
}

/** An enum member argument arrives as the member; take its name. */
function enumName(v: unknown): string {
  const m = unwrap(v);
  if (m && typeof m === "object" && "name" in (m as any)) return String((m as any).name);
  return String(m);
}

/** An enum member's wire value, which is this target's spelling of the rule. */
function enumValue(v: unknown): string {
  const u = unwrap(v) as any;
  if (u && typeof u === "object") return String(u.value ?? u.name);
  return String(u);
}

function set(ctx: Ctx, key: symbol, target: Type, value: unknown): void {
  ctx.program.stateMap(key).set(target, value);
}

function push(ctx: Ctx, key: symbol, target: Type, value: unknown): void {
  const map = ctx.program.stateMap(key);
  const existing = (map.get(target) as unknown[] | undefined) ?? [];
  existing.push(value);
  map.set(target, existing);
}

/**
 * The rule name is each entry's enum *value*, which is this target's wire spelling.
 * Marshalled here so the emitter sees a plain `path -> rule` map.
 */
export const $prePopulate = (ctx: Ctx, target: Model, rules: unknown) => {
  const table = plain(ctx, rules) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [path, rule] of Object.entries(table ?? {})) {
    out[path] = enumValue(rule);
  }
  set(ctx, stateKeys.prePopulate, target, out);
};

/** The widget name is the enum member's name, which is the component's name. */
export const $multiField = (ctx: Ctx, target: Model, section: unknown, widget: unknown) =>
  push(ctx, stateKeys.multiField, target, {
    section: sectionName(section),
    widget: enumName(widget),
  });

function sectionName(v: unknown): string {
  const m = v as any;
  if (m && typeof m === "object") {
    if (m.name) return String(m.name);
    if (m.value?.name) return String(m.value.name);
  }
  return String(v);
}

export const $fieldList = (ctx: Ctx, target: ModelProperty, options: unknown) =>
  set(ctx, stateKeys.fieldList, target, plain(ctx, options));
