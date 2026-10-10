import {
  categoryCounts,
  defaultCell,
  differences,
  diffTypeCounts,
  summarize,
  visibleDifferences,
  visibleFields,
  type CellRef,
  type DiffType,
  type FilterKey,
  type FormComparison,
} from "@/lib/comparison";
import { atom, computed } from "nanostores";

export type SheetTab = "comparison" | "differences";

/** The form's comparison, set once by the island that shows it. */
export const $comparison = atom<FormComparison>({ sections: [], fields: [] });
export const $categoryFilter = atom<FilterKey[]>([]);
export const $selectedFieldId = atom<string | null>(null);
export const $sheetTab = atom<SheetTab>("comparison");
/** The cell chosen in the matrix; null shows the field's first difference. */
export const $selectedCell = atom<CellRef | null>(null);
export const $diffTypeFilter = atom<DiffType[]>([]);

export const $visibleFields = computed(
  [$comparison, $categoryFilter],
  (comparison, filter) => visibleFields(comparison.fields, filter),
);

export const $categoryCounts = computed($comparison, (comparison) =>
  categoryCounts(comparison.fields),
);

export const $selectedField = computed(
  [$comparison, $selectedFieldId],
  (comparison, id) =>
    comparison.fields.find((field) => field.id === id) ?? null,
);

export const $summary = computed($selectedField, (field) =>
  field ? summarize(field) : "",
);

/** The selected cell with its row, falling back to the field's first difference. */
export const $focusedCell = computed(
  [$selectedField, $selectedCell],
  (field, selected) => {
    if (!field) return null;
    const ref = selected ?? defaultCell(field);
    const row = ref && field.rows.find((r) => r.attribute === ref.attribute);
    return ref && row ? { ...ref, row, cell: row.cells[ref.source] } : null;
  },
);

export const $visibleDifferences = computed(
  [$selectedField, $diffTypeFilter],
  (field, filter) => (field ? visibleDifferences(field, filter) : []),
);

/** Every difference the selected field has, whatever the type filter. */
export const $differenceCount = computed($selectedField, (field) =>
  field ? differences(field).length : 0,
);

export const $diffTypeCounts = computed($selectedField, (field) =>
  field ? diffTypeCounts(field) : { gap: 0, upstream: 0, intentional: 0 },
);

const toggle = <T>(list: readonly T[], item: T) =>
  list.includes(item)
    ? list.filter((other) => other !== item)
    : [...list, item];

export const toggleCategory = (key: FilterKey) =>
  $categoryFilter.set(toggle($categoryFilter.get(), key));

export const clearCategories = () => $categoryFilter.set([]);

/** Opens the sheet on a field, starting from its first difference with no type filter. */
export function openField(id: string) {
  $selectedCell.set(null);
  $diffTypeFilter.set([]);
  $sheetTab.set("comparison");
  $selectedFieldId.set(id);
}

export const closeSheet = () => $selectedFieldId.set(null);

export const selectCell = (ref: CellRef) => $selectedCell.set(ref);

export const setSheetTab = (tab: SheetTab) => $sheetTab.set(tab);

export const toggleDiffType = (type: DiffType) =>
  $diffTypeFilter.set(toggle($diffTypeFilter.get(), type));
