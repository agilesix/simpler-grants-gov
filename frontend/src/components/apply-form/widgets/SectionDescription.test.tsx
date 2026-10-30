import { render, screen } from "@testing-library/react";

import { SectionDescription } from "./SectionDescription";

describe("SectionDescription", () => {
  it("keeps unmarked descriptions escaped and split into paragraphs", () => {
    render(
      <SectionDescription
        description={"<strong>Literal</strong>\n\nSecond line"}
      />,
    );
    expect(
      screen.getByText("<strong>Literal</strong>", { selector: "p" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Second line", { selector: "p" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Literal", { selector: "strong" }),
    ).not.toBeInTheDocument();
  });

  it("preserves opted-in prose structure without introducing form controls", () => {
    render(
      <form aria-label="Instructions">
        <SectionDescription
          descriptionFormat="html"
          description={
            '<p>Read <strong>all</strong> items.</p><ul><li>First</li><li>Second</li></ul><input name="injected" value="yes"><textarea name="notes">No</textarea><button name="action">No</button><script>alert(1)</script><img src=x onerror="alert(1)">'
          }
        />
      </form>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("all", { selector: "strong" })).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { hidden: true }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { hidden: true })).not.toBeInTheDocument();
    const form = screen.getByRole("form", { name: "Instructions" });
    expect(form).not.toContainHTML("<script>alert(1)</script>");
    expect([...new FormData(form as HTMLFormElement).keys()]).toEqual([]);
  });

  it("handles an empty description without adding a wrapper", () => {
    const { container, rerender } = render(<SectionDescription />);
    expect(container).toBeEmptyDOMElement();
    rerender(<SectionDescription description="" descriptionFormat="html" />);
    expect(container).toBeEmptyDOMElement();
  });
});
