import { isStarted, summaryRows, type SummaryItem } from "@/lib/collapsible";

/** A collapsed section's answers, label beside value, like the form metadata card. */
export default function SummaryList({ items }: { items: SummaryItem[] }) {
  if (!isStarted(items))
    return <p className="collapsible__not-started">Not started</p>;
  return (
    <dl className="collapsible__summary">
      {summaryRows(items).map((row, index) => (
        <div key={index} className="collapsible__summary-row">
          <dt>{row.label}</dt>
          <dd className={`collapsible__value--${row.status}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
