import type { FieldNode } from "@/content.config";

interface Item {
  term: string;
  value?: string;
}

function Group({ title, items }: { title: string; items: Item[] }) {
  const stated = items.filter((item) => item.value);
  if (!stated.length) return null;
  return (
    <div className="field-details__group">
      <p className="field-details__title">{title}</p>
      <dl className="field-detail-grid">
        {stated.map(({ term, value }) => (
          <div key={term} className="field-detail-grid__item">
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Where the field lives in each source, and what fills it in, collapsed by default. */
export default function FieldDetails({ field }: { field: FieldNode }) {
  const ids = [
    { term: "DAT #", value: field.dat_field },
    { term: "XSD path", value: field.xml_path },
    { term: "JSON path", value: field.json_path },
  ];
  const population = [
    { term: "Pre-populated", value: field.pre_populated },
    { term: "Post-populated", value: field.post_populated },
  ];
  if (![...ids, ...population].some((item) => item.value)) return null;
  return (
    <details className="field-row__detail">
      <summary>Details</summary>
      <Group title="Source IDs" items={ids} />
      <Group title="Populated from other forms" items={population} />
    </details>
  );
}
