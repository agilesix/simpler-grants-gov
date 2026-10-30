import type { Layout } from "@jsonforms/core";
import type { RJSFSchema } from "@rjsf/utils";

/**
 * ED Abstract FID267 v1.1 design fixture, NOT emitted TypeSpec or a registered form.
 * DAT1-1..1-12: https://apply07.grants.gov/apply/forms/sample/ED_Abstract-V1.1_F267.xls
 * Source-state notices2-0/3-0/4-0 are separate unresolved design questions.
 */
const introduction =
  "An abstract is to be submitted in accordance with the following:";
const requirementsHeading = "1. Abstract Requirements";
const general = [
  "Abstracts must not exceed one page and should use language that will be understood by a range of audiences.",
  "Abstracts must include the project title, goals, and expected outcomes and contributions related to research, policy, and practice.",
  "Abstracts must include the population(s) to be served.",
  "Abstracts must include primary activities to be performed by the recipient.",
  "Abstracts must include subrecipient activities that are known or specified at the time of application submission.",
];
const researchIntroduction =
  "For research applications, abstracts also include the following:";
const research = [
  "Theoretical and conceptual background of the study (i.e., prior research that the investigation builds upon and that provides a compelling rationale for this study).",
  "Research issues, hypotheses and questions being addressed.",
  "Study design including a brief description of the sample including sample size, methods, principals, and dependent, independent, and control variables, as well as the approach to data analysis.",
];
const note =
  "[Note: For a non-electronic submission, include the name and address of your organization and the name, phone number and e-mail address of the contact person for this project.]";

const escape = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const paragraph = (text: string) => `<p>${escape(text)}</p>`;
const list = (items: string[]) =>
  `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join("")}</ul>`;
export const plainInstructions = [
  introduction,
  requirementsHeading,
  ...general.map((item) => `• ${item}`),
  researchIntroduction,
  ...research.map((item) => `• ${item}`),
  note,
].join("\n\n");
export const htmlInstructions = [
  paragraph(introduction),
  paragraph(requirementsHeading),
  list(general),
  paragraph(researchIntroduction),
  list(research),
  paragraph(note),
].join("");

// The existing UUID-backed Attachment shape is held constant; only display metadata varies.
export const schema = {
  type: "object",
  required: ["attachment"],
  additionalProperties: false,
  properties: {
    attachment: { type: "string", format: "uuid", title: "Attachment" },
  },
} satisfies RJSFSchema;
export const uiSchema = (rich: boolean): Layout => ({
  type: "VerticalLayout",
  elements: [
    {
      type: "Group",
      label: "Abstract",
      options: {
        description: rich ? htmlInstructions : plainInstructions,
        // PROPOSED metadata: no TypeSpec decorator/emitter contract exists yet.
        ...(rich ? { descriptionFormat: "html" } : {}),
      },
      elements: [
        {
          type: "Control",
          scope: "#/properties/attachment",
          options: { widget: "Attachment" },
        },
      ],
    },
  ],
});
