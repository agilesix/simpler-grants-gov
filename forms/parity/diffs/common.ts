import type { Pinned, Recorded } from "../harness/model.ts";

/** A label the form library standardized across forms, where this form's DAT words it differently. */
export const standardLabel = (plan: string, source: string): Pinned => ({
  plan,
  source,
  category: "intentional",
  reason:
    "Shared questions use one label across forms. The DATs word these fields several ways; the form library standardizes on the most common or clearest.",
});

/** Help text a shared question words once for every form, where this form's DAT words it differently. */
export const SHARED_HELP: Recorded = {
  category: "intentional",
  reason:
    "Shared questions use one help text across forms, written in the question bank, so it does not follow this DAT's wording: role names, “Please”, or “This field is required.” (the form marks required fields itself).",
};

/** Help that says “Enter” for a field the form shows as a dropdown list. */
export const LIST_HELP: Recorded = {
  category: "gap",
  reason:
    "The shared question's help says “Enter” for a field the form shows as a dropdown list. The DAT's “Select … from the provided list” describes it more accurately.",
};

/** Prefix and Suffix, which Grants.gov offers as a list and the form does not. */
export const FREE_TEXT_HELP: Recorded = {
  category: "intentional",
  reason:
    "Grants.gov offers a list of prefixes and suffixes alongside free text. The form uses a free-text field only, so its help does not mention a list.",
};
