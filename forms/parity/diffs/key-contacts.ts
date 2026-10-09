import type { FormDiff, Renamed } from "../harness/model.ts";

const contactInfo: Record<string, Renamed> = Object.fromEntries(
  ["phone", "fax", "email"].map((field) => [
    `key_contacts[].${field}`,
    {
      to: `key_contacts[].contact.${field}`,
      category: "intentional",
      reason:
        "The plan lists phone, fax and email beside the contact's name, as the existing SGG form does; the spec groups them in one shared `contact` question (Questions.Types.ContactInfo).",
    },
  ]),
);

export const DIFF: FormDiff = {
  slug: "key-contacts",
  jsonSchema: { renamed: contactInfo },
  uiSchema: { renamed: contactInfo },
};
