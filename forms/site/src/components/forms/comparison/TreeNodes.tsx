import {
  rollupCounts,
  type FieldComparison,
  type FilterKey,
  type VisibleNode,
} from "@/lib/comparison";

import FieldRow from "./FieldRow";
import FieldSection from "./FieldSection";

interface Props {
  nodes: VisibleNode[];
  fields: ReadonlyMap<string, FieldComparison>;
  filter: readonly FilterKey[];
  depth?: number;
}

/** One level of the tree: a row for each field, and a section for each group. */
export default function TreeNodes({ nodes, fields, filter, depth = 0 }: Props) {
  return nodes.map((node, index) => {
    if (node.kind === "section")
      return (
        <FieldSection
          key={index}
          node={node}
          depth={depth}
          counts={rollupCounts(node, fields, filter)}
          filtering={filter.length > 0}
        >
          <TreeNodes
            nodes={node.children}
            fields={fields}
            filter={filter}
            depth={depth + 1}
          />
        </FieldSection>
      );
    const comparison = fields.get(node.id);
    return comparison ? (
      <FieldRow key={node.id} comparison={comparison} />
    ) : null;
  });
}
