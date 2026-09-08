import "@typespec/json-schema";
import "simpler-forms";

using SimplerForms;

/**
 * No base URI is declared. A block's identity is its `@Meta.question.id`; where the
 * artifacts are hosted is a per-consumer decision, so the base is supplied at build
 * time (`scripts/merge.mjs --base`) rather than baked into the specs.
 */
@JsonSchema.jsonSchema
namespace QuestionBank;
