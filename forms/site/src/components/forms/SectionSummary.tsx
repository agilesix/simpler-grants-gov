import type { SectionNode } from "@/content.config";
import { repeatLabel } from "@/lib/comparison";
import type { ReactNode } from "react";

interface Props {
  section: Omit<SectionNode, "children">;
  /** e.g. "19 fields", or "2 of 19 fields" while a filter is on. */
  count: string;
  /** Badges summing the section's differences, when the form is compared. */
  badges?: ReactNode;
}

/** What a section's `<summary>` shows: its label, how often it repeats, and its fields. */
export default function SectionSummary({ section, count, badges }: Props) {
  const repeats = repeatLabel(section);
  return (
    <>
      <span className="field-section__label">{section.label}</span>
      {repeats && <span className="section-chip">↻ {repeats}</span>}
      {badges}
      <span className="section-count">{count}</span>
    </>
  );
}
