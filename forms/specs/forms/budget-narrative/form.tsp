import "simpler-forms";
import "form-library-xml";
import "#forms/index.tsp";
import "#questions/types/attachment.tsp";
using SimplerForms;
namespace Forms.BudgetNarrative;
@Meta.form(#{
  id: "budget-narrative",
  formName: "Budget Narrative Attachment Form",
})
@GrantsGov.form(#{
  legacyFormId: 543,
  shortFormName: "BudgetNarrativeAttachments_1_2",
  formVersion: "1.2",
  agencyCode: "SGG",
})
@example(
  #{ attachments: #["00b9001b-6ca8-4c0c-9328-46f39e9ff14b"] },
  #{ title: "One budget narrative file" }
)
@example(
  #{
    attachments: #[
      "00b9001b-6ca8-4c0c-9328-46f39e9ff14b",
      "c8eebbcc-a6ec-4b20-9bfa-e6bcc5abb6d5"
    ],
  },
  #{ title: "Two ordered budget narrative files" }
)
model BudgetNarrative {
  @doc("At least one file must be attached")
  @UI.label("Budget Narrative Files")
  @UI.widget(Rendering.Widget.AttachmentArray)
  @minItems(1)
  @maxItems(100)
  attachments: Questions.Types.Attachment[];
}
