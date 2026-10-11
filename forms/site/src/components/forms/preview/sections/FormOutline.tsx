import { outlineTree, type Crumb, type OutlineNode } from "@/lib/breadcrumbs";
import type { MouseEvent } from "react";

interface Props {
  sections: Crumb[];
  /** The sections the reader is inside, outermost first. */
  trail: Crumb[];
  goTo: (id: string) => void;
}

/**
 * The form's sections beside it, ported from the frontend's `LeftHandFormNav` (the USWDS
 * in-page navigation on the apply form). That one lists only the top-level sections; this one
 * nests each section's own under it, and marks the sections the reader is in.
 */
export default function FormOutline({ sections, trail, goTo }: Props) {
  if (!sections.length) return null;
  const inside = new Set(trail.map((crumb) => crumb.id));
  const current = trail.at(-1)?.id;

  const list = (nodes: OutlineNode[], sub: boolean) => (
    <ul
      className={`usa-in-page-nav__list${sub ? " form-outline__sublist" : ""}`}
    >
      {nodes.map((node) => (
        <li
          key={node.id}
          className={`usa-in-page-nav__item${sub ? " usa-in-page-nav__item--sub" : ""}`}
        >
          <a
            className={`usa-link usa-in-page-nav__link${node.id === current ? " usa-current" : ""}${inside.has(node.id) ? " form-outline__link--inside" : ""}`}
            href={`#${node.id}`}
            aria-current={node.id === current ? "location" : undefined}
            onClick={(event: MouseEvent) => {
              event.preventDefault();
              goTo(node.id);
            }}
          >
            {node.label}
          </a>
          {node.children.length > 0 && list(node.children, true)}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className="usa-in-page-nav form-outline maxw-card order-1 margin-left-0 desktop:margin-right-5 overflow-auto"
      aria-label="Sections in this form"
    >
      <nav className="usa-in-page-nav__nav padding-x-0">
        <h4 className="usa-in-page-nav__heading">Sections in this form</h4>
        {list(outlineTree(sections), false)}
      </nav>
    </aside>
  );
}
