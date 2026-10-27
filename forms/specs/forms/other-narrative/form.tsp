import "simpler-forms";
import "form-library-xml";
import "#forms/index.tsp";
import "#questions/types/attachment.tsp";
using SimplerForms;
namespace Forms.OtherNarrative;
@Meta.form(#{ id: "other-narrative", formName: "Other Narrative Attachments" })
@GrantsGov.form(#{
  legacyFormId: 542,
  shortFormName: "OtherNarrativeAttachments",
  formVersion: "1.2",
  agencyCode: "SGG",
})
@example(
  #{ attachments: #["00b9001b-6ca8-4c0c-9328-46f39e9ff14b"] },
  #{ title: "One other narrative file" }
)
@example(
  #{
    attachments: #[
      "00b9001b-6ca8-4c0c-9328-46f39e9ff14b",
      "c8eebbcc-a6ec-4b20-9bfa-e6bcc5abb6d5"
    ],
  },
  #{ title: "Two ordered other narrative files" }
)
model OtherNarrative {
  @doc("At least one file must be attached")
  @UI.label("Other Narrative Files")
  @UI.widget(Rendering.Widget.AttachmentArray)
  @minItems(1)
  @maxItems(100)
  attachments: Questions.Types.Attachment[];
}
