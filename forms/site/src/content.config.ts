import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const widgets = z.enum([
  "TextWidget",
  "SelectWidget",
  "RadioWidget",
  "CheckboxWidget",
  "TextAreaWidget",
  "ApplicationAttachmentWidget",
  "ApplicationMultipleAttachmentWidget",
  "FieldListWidget",
  "FieldsetWidget",
  "MultiSelectWidget",
  "TableWidget",
]);

const fieldSchema = z.object({
  label: z.string(),
  dat_field: z.string().optional(),
  required: z.union([z.boolean(), z.string()]),
  type: z.string(),
  widget: z.string().optional(),
  help_text: z.string().optional(),
  constraints: z.string().optional(),
  pre_populated: z.string().optional(),
  post_populated: z.string().optional(),
  json_path: z.string().optional(),
  xml_path: z.string().optional(),
});

const sectionSchema = z.object({
  title: z.string(),
  fields: z.array(fieldSchema),
});

const formSchema = z.object({
  title: z.string(),
  slug: z.string(),
  omb_number: z.string().optional().default(""),
  expiration_date: z.string().optional().default(""),
  fid_url: z.string().url().optional(),
  pdf_url: z.string().url().optional(),
  xsd_url: z.string().url().optional(),
  dat_url: z.string().url().optional(),
  apps_count: z.number().optional().default(0),
  status: z.enum([
    "backlog",
    "prioritized",
    "in_progress",
    "migrated",
    "ready",
  ]),
  /** Grants.gov form families, e.g. ["R&R"]; empty for forms outside any family. */
  family: z.array(z.string()).default([]),
  category: z.string().optional(),
  widgets: z.array(z.string()).optional().default([]),
  sgg_form_id: z.string().nullable().optional().default(null),
  /** Id of the compiled TypeSpec form in forms/dist/canonical/forms/, if one exists. */
  spec_id: z.string().optional(),
  description: z.string().optional().default(""),
  new_concepts: z.array(widgets).optional(),
  sections: z.array(sectionSchema).optional().default([]),
  deviations: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
});

export type FormData = z.infer<typeof formSchema>;
export type FieldData = z.infer<typeof fieldSchema>;
export type SectionData = z.infer<typeof sectionSchema>;

export const TOTAL_APPS = 4_072_033;

export const collections = {
  forms: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/forms" }),
    schema: formSchema,
  }),
};
