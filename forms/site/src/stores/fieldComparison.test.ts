import { beforeEach, describe, expect, it } from "vitest";

import {
  $attributeFilter,
  $categoryFilter,
  $comparison,
  $visibleTree,
} from "./fieldComparison";

describe("reading-only instructions in the comparison tree", () => {
  beforeEach(() => {
    $categoryFilter.set([]);
    $attributeFilter.set([]);
    $comparison.set({
      fields: [],
      children: [
        {
          kind: "section",
          section: {
            kind: "section",
            label: "Assurances",
            widget: "Instructions",
            help_text: "Legal requirements",
          },
          children: [],
        },
      ],
    });
  });
  it("retains instructions without adding comparison fields", () => {
    expect($visibleTree.get()).toHaveLength(1);
    expect($comparison.get().fields).toEqual([]);
  });
  it("does not keep an empty tree alive when a field filter is applied", () => {
    $categoryFilter.set(["gap"]);
    expect($visibleTree.get()).toEqual([]);
  });
  it("restores instructions after an attribute filter is cleared", () => {
    $attributeFilter.set(["label"]);
    expect($visibleTree.get()).toEqual([]);
    $attributeFilter.set([]);
    expect($visibleTree.get()).toHaveLength(1);
  });
});
