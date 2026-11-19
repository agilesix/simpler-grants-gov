import { FormattedFormValidationWarning } from "src/types/applyForm/types";

/**
 * Re-aligns row-aware FieldList validation warnings after an entry is deleted.
 *
 * Validation warnings are indexed by entry (for example
 * `$.contact_people_test[1].first_name`). When an entry is removed locally,
 * the remaining entries shift indices. This helper:
 *
 * - removes warnings for the deleted entry
 * - shifts warnings for subsequent entries down by one index, including the
 *   warnings of a list inside those entries
 * - leaves earlier entries unchanged
 *
 * This keeps the UI aligned with the current entry state until the next
 * backend validation pass.
 */
export const rebaseFieldListWarningsAfterDelete = ({
  rawErrors,
  fieldListPath,
  deletedEntryIndex,
}: {
  rawErrors?: FormattedFormValidationWarning[] | null;
  fieldListPath: string;
  deletedEntryIndex: number;
}): FormattedFormValidationWarning[] | null => {
  if (!rawErrors?.length) {
    return rawErrors ?? null;
  }

  const escapedFieldListPath = fieldListPath
    .replace(/^\$\./, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return rawErrors.flatMap((warning) => {
    const entryAwareFieldMatch = warning.field.match(
      new RegExp(`^\\$\\.${escapedFieldListPath}\\[(\\d+)\\]\\.(.+)$`),
    );

    if (!entryAwareFieldMatch) {
      return [warning];
    }

    const [, entryIndexText, storageKey] = entryAwareFieldMatch;
    const entryIndex = Number(entryIndexText);

    if (Number.isNaN(entryIndex)) {
      return [warning];
    }

    if (entryIndex === deletedEntryIndex) {
      return [];
    }

    if (entryIndex < deletedEntryIndex) {
      return [warning];
    }

    const nextField = `${fieldListPath}[${entryIndex - 1}].${storageKey}`;
    // The list's entry index is the same index in the HTML name as in the path,
    // e.g. the second in both `$.people[0].phones[2].number` and `people[0]--phones[2]--number`.
    const listDepth = fieldListPath.match(/\[\d+\]/g)?.length ?? 0;

    return [
      {
        ...warning,
        field: nextField,
        htmlField:
          warning.htmlField &&
          replaceIndexAt(warning.htmlField, listDepth, entryIndex - 1),
      },
    ];
  });
};

/** Replaces the `depth`th list index in a path or HTML name: `a[0]--b[2]`, 1, 1 -> `a[0]--b[1]`. */
const replaceIndexAt = (name: string, depth: number, index: number): string => {
  let seen = -1;
  return name.replace(/\[\d+\]/g, (match) =>
    ++seen === depth ? `[${index}]` : match,
  );
};
