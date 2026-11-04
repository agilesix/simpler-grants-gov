import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import SectionMeta from "./SectionMeta";
import SectionSummary from "./SectionSummary";

describe("instruction sections in the review tree", () => {
  const section = {
    kind: "section" as const,
    label: "Assurances",
    widget: "Instructions",
    help_text: "<ol><li>First</li><li><strong>Second</strong></li></ol>",
  };

  it("shows source lists as reading content instead of italic field help", () => {
    const html = renderToStaticMarkup(<SectionMeta section={section} />);
    expect(html).toContain(
      "<ol><li>First</li><li><strong>Second</strong></li></ol>",
    );
    expect(html).not.toContain('class="field-row__help"');
  });

  it("keeps unmarked section help escaped", () => {
    const html = renderToStaticMarkup(
      <SectionMeta section={{ ...section, widget: undefined }} />,
    );
    expect(html).toContain("&lt;ol&gt;");
    expect(html).toContain('class="field-row__help"');
  });

  it("does not label a reading-only section as zero answer fields", () => {
    const html = renderToStaticMarkup(
      <SectionSummary section={section} count="0 fields" contents={[]} />,
    );
    expect(html).toContain("Assurances");
    expect(html).not.toContain("0 fields");
  });

  it("retains the answer count when instructions introduce actual fields", () => {
    const html = renderToStaticMarkup(
      <SectionSummary
        section={section}
        count="5 fields"
        contents={["Organization"]}
      />,
    );
    expect(html).toContain("5 fields");
  });
});
