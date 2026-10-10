import { fieldCount, type ComparisonNode } from "@/lib/comparison";
import type { ReactNode } from "react";

interface Props {
  node: Extract<ComparisonNode, { kind: "section" }>;
  children: ReactNode;
}

export default function FieldSection({ node, children }: Props) {
  const count = fieldCount(node);
  return (
    <details className="field-section" open>
      <summary>
        {node.section.label}
        <span className="section-count">
          {count} {count === 1 ? "field" : "fields"}
        </span>
      </summary>
      <div className="field-section__body">{children}</div>
    </details>
  );
}
