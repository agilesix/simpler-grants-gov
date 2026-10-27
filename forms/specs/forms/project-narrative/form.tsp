import "simpler-forms";
import "form-library-xml";
import "#forms/index.tsp";
import "#questions/types/attachment.tsp";
using SimplerForms;
namespace Forms.ProjectNarrative;
@Meta.form(#{
  id: "project-narrative",
  formName: "Project Narrative Attachment Form",
})
@GrantsGov.form(#{
  legacyFormId: 539,
  shortFormName: "ProjectNarrativeAttachments_1_2",
  formVersion: "1.2",
  agencyCode: "SGG",
})
@example(
  #{ attachments: #["00b9001b-6ca8-4c0c-9328-46f39e9ff14b"] },
  #{ title: "One project narrative file" }
)
@example(
  #{
    attachments: #[
      "00b9001b-6ca8-4c0c-9328-46f39e9ff14b",
      "c8eebbcc-a6ec-4b20-9bfa-e6bcc5abb6d5"
    ],
  },
  #{ title: "Two ordered project narrative files" }
)
model ProjectNarrative {
  @doc("At least one file must be attached")
  @UI.label("Project Narrative Files")
  @UI.widget(Rendering.Widget.AttachmentArray)
  @minItems(1)
  @maxItems(100)
  attachments: Questions.Types.Attachment[];
}
