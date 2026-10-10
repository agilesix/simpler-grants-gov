import type { SectionNode } from "@/content.config";

import FieldDetails from "./comparison/FieldDetails";

/**
 * What a section says about itself, laid out as a field row lays out a field: its help text,
 * its widget, and the same collapsed Details with its source IDs.
 */
export default function SectionMeta({
  section,
}: {
  section: Omit<SectionNode, "children">;
}) {
  return (
    <div className="section-meta">
      {section.help_text && (
        <div className="field-row__help">{section.help_text}</div>
      )}
      {section.widget && (
        <div className="field-row__tertiary">{section.widget}</div>
      )}
      <FieldDetails field={section} />
    </div>
  );
}
