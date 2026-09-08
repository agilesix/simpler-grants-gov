import "simpler-forms";
import "../index.tsp";
import "../generated/codes.tsp";

using SimplerForms;


namespace QuestionBank.Generics;

// The answer to an attachment question is the uploaded file's id, not the file itself. A
// form's schema validates what an applicant submits, and an applicant does not author a
// file's name, size, or MIME type -- the server does. So the value is opaque here, and
// checking that it names a file actually attached to this application is a job for the
// runtime rather than for JSON Schema. That check is what SGG spells
// `gg_validation: attachment`, and `rules-sgg` derives it from this question's identity.
//
// What the reference resolves *to* is a separate type: `CommonGrants.Fields.File`
// (`downloadUrl`, `name`, `sizeInBytes`, `mimeType`, plus system metadata). The mapping
// from this question to that model is a lookup rather than a transformation, so it is
// one-way -- see `documentation/deferred-designs.md`.
//
// A doc comment becomes the question's description, which applicants read. Rationale for
// the reader of this file goes in `//` comments, which no artifact carries.
/** Attach a file. */
@Meta.question(#{
  id: "generics/attachment",
  classification: BlockClassification.captureMechanism,
  entity: EntityName.generic,
})
@Meta.tag(TagName.attachment)
@format("uuid")
scalar AttachmentRef extends string;
