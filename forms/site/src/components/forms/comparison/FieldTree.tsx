import { $comparison, $visibleFields } from "@/stores/fieldComparison";
import { useStore } from "@nanostores/react";

import FieldSection from "./FieldSection";

/** The plan's sections, each with the fields the current filter shows. */
export default function FieldTree() {
  const { sections } = useStore($comparison);
  const visible = useStore($visibleFields);
  const shown = sections
    .map((section, index) => ({
      ...section,
      index,
      fields: visible.filter((field) => field.sectionIndex === index),
    }))
    .filter((section) => section.fields.length > 0);
  if (!shown.length)
    return <p className="text-base">No fields match this filter.</p>;
  return (
    <div className="field-tree">
      {shown.map((section) => (
        <FieldSection
          key={section.index}
          title={section.title}
          fields={section.fields}
        />
      ))}
    </div>
  );
}
