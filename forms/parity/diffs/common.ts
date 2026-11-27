import type { Pinned, Recorded, Wording } from "../harness/model.ts";

// =============================================================================
// WORDING
// =============================================================================

const BANK_LABEL: Recorded = {
  category: "intentional",
  reason:
    "The form uses the question bank's label, which is the same on every form that asks the question. The DATs word these fields several ways.",
};

const BANK_HELP: Recorded = {
  category: "intentional",
  reason:
    "The form uses the question's help, which is the same on every form that asks it. It leaves out the DAT's role names, “Please”, pre-population notes and “This field is required.”, since the form marks required fields itself.",
};

/** A label the form library standardized across forms, where this form's DAT words it differently. */
export const standardLabel = (plan: string, source: string): Pinned => ({
  plan,
  source,
  ...BANK_LABEL,
});

/** Help text a shared question words once for every form, where this form's DAT words it differently. */
export const SHARED_HELP: Recorded = BANK_HELP;

/** Labels and help text taken from the question bank rather than worded after the DAT. */
export const BANK_WORDING: Wording = { labels: BANK_LABEL, help: BANK_HELP };

/** Prefix and Suffix, which Grants.gov offers as a list and the form does not. */
export const FREE_TEXT_HELP: Recorded = {
  category: "intentional",
  reason:
    "Grants.gov offers a list of prefixes and suffixes alongside free text. The form uses a free-text field only, so its help does not mention a list.",
};

/** Help that only says the DAT pre-populates the field from another form. */
export const PREPOPULATED_HELP: Recorded = {
  category: "intentional",
  reason:
    "The DAT's help only says the field is pre-populated from the SF 424 (R&R). The form doesn't pre-populate it yet, so it uses the question bank's help.",
};

/** Labels and help kept from the existing SGG forms with a single attachment list. */
export const SGG_ATTACHMENT_WORDING: Wording = {
  labels: {
    category: "intentional",
    reason:
      "The form keeps the existing SGG form's label for its attachment list.",
  },
  help: {
    category: "intentional",
    reason:
      "The form keeps the existing SGG form's help for its attachment list.",
  },
};

// =============================================================================
// REQUIREDNESS AND OCCURRENCES
// =============================================================================

/** Whether two labels differ, ignoring case and repeated whitespace as the harness does. */
const reworded = (label: string, source: string) =>
  label.replace(/\s+/g, " ").toLowerCase() !==
  source.replace(/\s+/g, " ").toLowerCase();

/** Add the bank-label reason when the label differs by more than its star. */
const starred = (
  label: string,
  source: string,
  reason: string,
  category: Recorded["category"] = "upstream",
): Pinned => ({
  plan: label,
  source,
  category,
  reason: reworded(label.replace(/^\* /, ""), source.replace(/^\* /, ""))
    ? `${reason} ${BANK_LABEL.reason}`
    : reason,
});

// =============================================================================
// ITEM NUMBERS
// =============================================================================

/** A label whose item number is in its section's title, such as "3. Date Received". */
export const numberInSection = (
  plan: string,
  source: string,
  also?: string,
): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason: `The item number is in the section header, not the question text.${also ? ` ${also}` : ""}`,
});

/** A lettered label written with its full item number, such as "8a. Legal Name". */
export const fullItemNumber = (plan: string, source: string): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason:
    "The label includes the item number with the letter (8a, not a.), so it makes sense on its own in the error list. The DAT prints the number only on the item's heading.",
});

/** The DAT's I Agree label, whose "**" points to the footnote about the certifications list. */
export const agreeFootnote = (plan: string, source: string): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason:
    "The DAT's ** points to the footnote about the list of certifications. The form prints that footnote in the certification statement, so the label leaves the marker off.",
});

/** A DAT that stars a field its Required column marks optional, because a condition requires it. */
export const conditionalStar = (label: string, source = label): Pinned =>
  starred(
    label,
    `* ${source}`,
    "The DAT stars this field but its Required column says No: the field is required only when a condition the DAT states is met. The plan marks it conditional, so its label has no star.",
  );

/** A DAT that stars a field of an optional, repeating entry: an additional site or senior/key person. */
export const entryStar = (label: string, source = label): Pinned =>
  starred(
    label,
    `* ${source}`,
    "The DAT stars this field in every entry. The entries are optional, so the field is required only within an entry the applicant adds, and the plan's label has no star.",
  );

/** A field the DAT requires, within an optional, repeating entry. */
export const EACH_ENTRY_REQUIRED: Recorded = {
  category: "upstream",
  reason:
    "The DAT marks this field required. The XSD requires it only within each entry the applicant adds, and the entries are optional.",
};

/** A field of a repeating entry that the DAT allows once. */
export const ENTRY_OCCURRENCES: Recorded = {
  category: "upstream",
  reason:
    "The DAT gives this field 1 occurrence, though it is part of an entry the XSD repeats. The plan allows it once per entry, as the DAT does for the entry's other fields.",
};

/** The DAT's address heading rows, which have no answer of their own. */
export const ADDRESS_HEADING: Recorded = {
  category: "upstream",
  reason:
    "The DAT numbers the Address heading as a field. It has no answer of its own and no element in the XSD; its fields follow it.",
};

// =============================================================================
// ORDER
// =============================================================================

/** Fields the key-person forms place differently from the DAT. */
export const PROFILE_GROUPS: Recorded = {
  category: "intentional",
  reason:
    "The key-person forms ask for the organization's name or UEI, then its department and division, then the project role, all before the address. The DAT lists the department before the organization, and the project role after the contact details.",
};

// =============================================================================
// VALUES
// =============================================================================

/** Email fields, which leave out the XSD's minimum length. */
export const EMAIL_MIN_LENGTH: Pinned = {
  plan: null,
  source: 1,
  category: "intentional",
  reason:
    "globLib:EmailDataType has a minLength of 1. Email fields leave it out, as the API's hand-written forms do: format email already rejects an empty string, and two errors for the same problem is confusing.",
};

/** `differingRules` entries recording `EMAIL_MIN_LENGTH` for each email field's path. */
export const emailMinLength = (paths: string[]): Record<string, Pinned> =>
  Object.fromEntries(
    paths.map((path) => [`${path}/minLength`, EMAIL_MIN_LENGTH]),
  );

/** Congressional districts, whose format the DAT states and the XSD doesn't. */
export const DISTRICT_FORMAT: Recorded = {
  category: "upstream",
  reason:
    "The DAT's help gives the format: two characters, a hyphen, and three characters, such as CA-005 or 00-000. globLib:CongressionalDistrictDataType allows any 1 to 6 characters. The shared congressional district question follows the DAT.",
};

/** The I Agree checkbox, which the DAT requires checking and the XSD lets be No. */
export const MUST_AGREE: Recorded = {
  category: "upstream",
  reason:
    "The DAT requires checking I Agree, so the plan accepts only Y: Yes. globLib:YesNoDataType also allows N: No.",
};

// =============================================================================
// ATTACHMENTS
// =============================================================================

/** The DAT's additional-file control, which the form folds into its attachment list. */
export const ADDITIONAL_FILES: Recorded = {
  category: "intentional",
  reason:
    "The DAT has a separate control for additional files. The form puts them in the same list as the required file, as the existing SGG form does.",
};

/** Compare the required-file control with the limit on the combined list. */
export const attachmentListMax = (max: number): Pinned => ({
  plan: max,
  source: 1,
  category: "intentional",
  reason: `The DAT's 1 is for the required-file control. The list holds that file and any additional files, up to the XSD's limit of ${max}.`,
});
