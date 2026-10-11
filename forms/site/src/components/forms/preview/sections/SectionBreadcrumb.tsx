import { currentTrail, type Crumb, type CrumbAnchor } from "@/lib/breadcrumbs";
import { useEffect, useRef, useState, type RefObject } from "react";

/** How far past the bar's bottom a heading must scroll before the bar names it. */
const SLACK = 8;

function readAnchors(container: HTMLElement): CrumbAnchor[] {
  return [...container.querySelectorAll<HTMLElement>("[data-crumb-level]")].map(
    (element) => ({
      id: element.id,
      label: element.dataset.crumbLabel ?? "",
      level: Number(element.dataset.crumbLevel),
      top: element.getBoundingClientRect().top,
    }),
  );
}

/**
 * A bar that sticks to the top of the window while the form scrolls beneath it, naming the
 * sections the reader is inside, e.g. "Key Contacts › Key Contacts 1 › Name". Each crumb
 * scrolls back to its section's heading.
 */
export default function SectionBreadcrumb({
  container,
}: {
  container: RefObject<HTMLElement | null>;
}) {
  const bar = useRef<HTMLElement>(null);
  const [trail, setTrail] = useState<Crumb[]>([]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = container.current;
      if (!root) return;
      const offset = (bar.current?.getBoundingClientRect().bottom ?? 0) + SLACK;
      const next = currentTrail(readAnchors(root), offset);
      setTrail((current) =>
        current.map((c) => c.id).join() === next.map((c) => c.id).join()
          ? current
          : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Entries added or removed, and sections a rule shows or hides, move the headings.
    const observer = new MutationObserver(schedule);
    if (container.current)
      observer.observe(container.current, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [container]);

  const goTo = (id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    const barHeight = bar.current?.getBoundingClientRect().height ?? 0;
    window.scrollTo({
      top:
        window.scrollY +
        heading.getBoundingClientRect().top -
        barHeight -
        SLACK +
        1,
      behavior: "smooth",
    });
  };

  return (
    <nav
      ref={bar}
      className="section-breadcrumb"
      aria-label="Where you are in the form"
    >
      {trail.length === 0 ? (
        <span className="section-breadcrumb__top">Top of form</span>
      ) : (
        <ol className="section-breadcrumb__list">
          {trail.map((crumb, index) => {
            const current = index === trail.length - 1;
            return (
              <li key={crumb.id} className="section-breadcrumb__item">
                <button
                  type="button"
                  className={`section-breadcrumb__crumb${current ? " section-breadcrumb__crumb--current" : ""}`}
                  aria-current={current ? "location" : undefined}
                  onClick={() => goTo(crumb.id)}
                >
                  {crumb.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}
