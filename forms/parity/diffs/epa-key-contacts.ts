import type { FormDiff, Recorded, Renamed } from "../harness/model.ts";

const ROLES = [
  "authorized_representative",
  "payee",
  "administrative_contact",
  "project_manager",
];

const contactInfo: Record<string, Renamed> = Object.fromEntries(
  ROLES.flatMap((role) =>
    ["phone", "fax", "email"].map((field) => [
      `${role}.${field}`,
      {
        to: `${role}.contact.${field}`,
        category: "intentional",
        reason:
          "The plan lists phone, fax and email beside each contact's name, as the existing SGG form does; the spec groups them in one shared `contact` question (Questions.Types.ContactInfo).",
      },
    ]),
  ),
);

const addressOrder: Record<string, Recorded> = Object.fromEntries(
  ROLES.map((role) => [
    `${role}.address.country`,
    {
      category: "intentional",
      reason:
        "The PDF, DAT and current SGG form put ZIP/Postal Code before Country. The spec reuses the shared Address question, which puts Country first (as Key Contacts does), rather than reordering address fields per form.",
    },
  ]),
);

export const DIFF: FormDiff = {
  slug: "epa-key-contacts-form",
  jsonSchema: { renamed: contactInfo },
  uiSchema: { renamed: contactInfo, outOfOrder: addressOrder },
};
