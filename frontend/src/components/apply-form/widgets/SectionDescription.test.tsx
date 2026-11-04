import { render, screen } from "@testing-library/react";

import { SectionDescription } from "./SectionDescription";

describe("SectionDescription", () => {
  it("keeps ordinary descriptions escaped and split into paragraphs", () => {
    render(
      <SectionDescription
        description={"<strong>Literal</strong>\nSecond line"}
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

  it("preserves numbered and nested prose with safe complaint links", () => {
    render(
      <SectionDescription
        descriptionFormat="html"
        description={
          '<ol start="2"><li>First<ul><li>Nested</li></ul></li><li value="5">Last</li></ol><p><a href="https://example.invalid/complaint">Complaint</a> or <a href="mailto:review@example.invalid">email</a>.</p>'
        }
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getAllByRole("list")[0]).toHaveAttribute("start", "2");
    expect(screen.getByRole("link", { name: "Complaint" })).toHaveAttribute(
      "href",
      "https://example.invalid/complaint",
    );
    expect(screen.getByRole("link", { name: "email" })).toHaveAttribute(
      "href",
      "mailto:review@example.invalid",
    );
  });

  it("cannot add answer controls, active script, or unsafe links", () => {
    render(
      <form aria-label="Instructions">
        <SectionDescription
          descriptionFormat="html"
          description={
            '<p>Read <strong>all</strong> items.</p><input name="injected" value="yes"><textarea name="notes">Text</textarea><button name="action">Act</button><select name="choice"><option>One</option></select><script>alert(1)</script><img src=x onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(1)">Unsafe</a>'
          }
        />
      </form>,
    );
    expect(
      screen.queryByRole("textbox", { hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { hidden: true }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByText("Unsafe")).not.toHaveAttribute("href");
    expect(screen.getByText("Unsafe")).not.toHaveAttribute("onclick");
    const form = screen.getByRole("form", { name: "Instructions" });
    expect(form).not.toContainHTML("<script>alert(1)</script>");
    expect([...new FormData(form as HTMLFormElement).keys()]).toEqual([]);
    expect(screen.getByText("all", { selector: "strong" })).toBeInTheDocument();
  });

  it("adds no wrapper for an absent description", () => {
    const { container } = render(<SectionDescription />);
    expect(container).toBeEmptyDOMElement();
  });
});
