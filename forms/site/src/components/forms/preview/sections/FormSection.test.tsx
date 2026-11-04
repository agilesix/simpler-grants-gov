import type { LayoutProps } from "@jsonforms/core";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FormSection from "./FormSection";

const render = (widget?: string) =>
  renderToStaticMarkup(
    <FormSection
      {...({
        uischema: {
          type: "Group",
          label: "Assurances",
          elements: [],
          options: {
            widget,
            description:
              '<ol><li>Read <strong>all</strong> requirements.</li></ol><input name="fake" value="yes">',
          },
        },
        schema: {},
        path: "",
        visible: true,
        enabled: true,
        direction: "column",
      } as LayoutProps)}
    />,
  );

describe("preview instruction Group", () => {
  it("uses existing layout metadata for explicit prose rendering without answers", () => {
    const html = render("Instructions");
    expect(html).toContain(
      "<ol><li>Read <strong>all</strong> requirements.</li></ol>",
    );
    expect(html).not.toContain("<input");
    expect(html).toContain("Assurances");
  });
  it("keeps other group descriptions literal", () => {
    const html = render();
    expect(html).toContain("&lt;ol&gt;");
    expect(html).not.toContain("<strong>");
  });
});
