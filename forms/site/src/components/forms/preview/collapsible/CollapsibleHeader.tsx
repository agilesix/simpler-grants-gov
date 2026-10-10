import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  /** Errors in the section's fields, shown while it is collapsed. */
  errorCount?: number;
  /** Further actions after Edit/Collapse, e.g. a list entry's Delete. */
  actions?: ReactNode;
  /** Ties the section's fields to this heading for screen readers. */
  headingId?: string;
}

/** A collapsible section's header: a toggle naming the section, and Edit or Collapse. */
export default function CollapsibleHeader({
  title,
  collapsed,
  onToggle,
  errorCount = 0,
  actions,
  headingId,
}: Props) {
  return (
    <div className="collapsible__header">
      <button
        type="button"
        id={headingId}
        className="collapsible__toggle"
        aria-expanded={!collapsed}
        onClick={onToggle}
      >
        <span className="collapsible__caret" aria-hidden="true" />
        {title}
      </button>
      {collapsed && errorCount > 0 && (
        <span className="collapsible__errors">
          {errorCount} {errorCount === 1 ? "error" : "errors"}
        </span>
      )}
      <button
        type="button"
        className="usa-button usa-button--unstyled collapsible__action"
        onClick={onToggle}
      >
        {collapsed ? "Edit" : "Collapse"}
      </button>
      {actions}
    </div>
  );
}
