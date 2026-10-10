import type { SectionNode } from "@/content.config";

/** A section's help text and where it lives in each source, always visible under its summary. */
export default function SectionMeta({
  section,
}: {
  section: Omit<SectionNode, "children">;
}) {
  const ids = [
    { term: "JSON", value: section.json_path },
    { term: "XML", value: section.xml_path },
    { term: "DAT", value: section.dat_field },
    { term: "Widget", value: section.widget },
  ].filter((item) => item.value);
  if (!section.help_text && !ids.length) return null;
  return (
    <div className="section-meta">
      {section.help_text && (
        <p className="section-meta__help">{section.help_text}</p>
      )}
      {ids.length > 0 && (
        <dl className="section-meta__ids">
          {ids.map(({ term, value }) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
