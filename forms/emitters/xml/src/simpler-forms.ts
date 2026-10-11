import type {
  EnumMember,
  Model,
  ModelProperty,
  Program,
  Scalar,
} from "@typespec/compiler";
import * as sf from "simpler-forms";

// simpler-forms is installed from a sibling checkout (`file:../../simpler-forms`), so its
// declarations name the compiler in that checkout's node_modules, a different version from
// this package's. The values are the same objects at run time; only the declarations
// differ. These rebind the few this emitter uses to this package's compiler.
// TODO: import from "simpler-forms" directly once it is installed from the registry again.

export type PropertyCasing = sf.PropertyCasing;
export type MappingNodeKind = sf.MappingNodeKind;

export interface MappingNode {
  sourcePath: string[];
  source: ModelProperty;
  target?: ModelProperty;
  kind: MappingNodeKind;
  children: MappingNode[];
}

export interface ResolvedMapping {
  mapping: EnumMember;
  source: Model;
  target: Model;
  children: MappingNode[];
}

export interface Block {
  model: Model | Scalar;
  kind: "question" | "form";
  id: string;
}

export const allBlocks = sf.allBlocks as unknown as (
  program: Program,
) => Block[];
export const mappingTargets = sf.mappingTargets as unknown as (
  program: Program,
) => EnumMember[];
export const resolveMapping = sf.resolveMapping as unknown as (
  program: Program,
  model: Model,
  mapping: EnumMember,
) => ResolvedMapping | undefined;
export const modelProperties = sf.modelProperties as unknown as (
  model: Model,
) => ModelProperty[];
export const jsonPropertyName = sf.jsonPropertyName as unknown as (
  program: Program,
  property: ModelProperty,
  casing: PropertyCasing,
) => string;
