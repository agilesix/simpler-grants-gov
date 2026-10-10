import { FILTER_KEYS } from "@/lib/comparison";
import {
  $categoryFilter,
  $comparison,
  $visibleFields,
  clearCategories,
} from "@/stores/fieldComparison";
import { useStore } from "@nanostores/react";

import DeviationTile from "./DeviationTile";

/** The filter tiles above the field tree, and a way back to every field. */
export default function DeviationTiles() {
  const filtering = useStore($categoryFilter).length > 0;
  const shown = useStore($visibleFields).length;
  const total = useStore($comparison).fields.length;
  return (
    <div className="deviation-tiles">
      <div
        className="deviation-tiles__grid"
        role="group"
        aria-label="Filter fields by difference"
      >
        {FILTER_KEYS.map((key) => (
          <DeviationTile key={key} filterKey={key} />
        ))}
      </div>
      {filtering && (
        <p className="deviation-tiles__clear">
          <button
            type="button"
            className="usa-button--unstyled"
            onClick={clearCategories}
          >
            Clear filter
          </button>{" "}
          · showing {shown} of {total} fields
        </p>
      )}
    </div>
  );
}
