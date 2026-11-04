import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FieldSection from "./FieldSection";

describe("reading-only sections", () => {
  it("does not claim that un-compared instruction prose matches every source", () => {
    const html = renderToStaticMarkup(
      <FieldSection
        node={{
          kind: "section",
          section: {
            kind: "section",
            label: "Assurances",
            help_text: "Source instructions",
            widget: "Instructions",
          },
          children: [],
          total: 0,
        }}
        contents={[]}
        depth={0}
        counts={{ unrecorded: 0, gap: 0, upstream: 0, intentional: 0 }}
        filtering={false}
      >
        {null}
      </FieldSection>,
    );
    expect(html).toContain("Source instructions");
    expect(html).not.toContain("Matches every source");
    expect(html).not.toContain("0 fields");
  });
});
