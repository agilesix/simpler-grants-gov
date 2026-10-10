import type { FieldComparison } from "@/lib/comparison";

import FieldRow from "./FieldRow";

interface Props {
  title: string;
  fields: FieldComparison[];
}

export default function FieldSection({ title, fields }: Props) {
  return (
    <details className="field-section" open>
      <summary>
        {title}
        <span className="section-count">
          {fields.length} {fields.length === 1 ? "field" : "fields"}
        </span>
      </summary>
      <div className="field-section__body">
        {fields.map((field) => (
          <FieldRow key={field.id} comparison={field} />
        ))}
      </div>
    </details>
  );
}
