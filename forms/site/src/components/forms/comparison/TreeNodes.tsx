import type { ComparisonNode, FieldComparison } from "@/lib/comparison";

import FieldRow from "./FieldRow";
import FieldSection from "./FieldSection";

interface Props {
  nodes: ComparisonNode[];
  fields: ReadonlyMap<string, FieldComparison>;
}

/** One level of the tree: a row for each field, and a section for each group. */
export default function TreeNodes({ nodes, fields }: Props) {
  return nodes.map((node, index) => {
    if (node.kind === "section")
      return (
        <FieldSection key={index} node={node}>
          <TreeNodes nodes={node.children} fields={fields} />
        </FieldSection>
      );
    const comparison = fields.get(node.id);
    return comparison ? (
      <FieldRow key={node.id} comparison={comparison} />
    ) : null;
  });
}
