import DOMPurify from "isomorphic-dompurify";

/**
 * Section prose is plain text unless its layout explicitly opts into HTML.
 * Only reading content is allowed: instructions must never add submitted controls.
 */
export const SectionDescription = ({
  description,
  descriptionFormat,
  paragraphClassName,
}: {
  description?: string;
  descriptionFormat?: "html";
  paragraphClassName?: string;
}) => {
  if (!description) return null;
  if (descriptionFormat === "html")
    return (
      <div
        className="section-instructions"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(description, {
            ALLOWED_TAGS: ["p", "ul", "ol", "li", "strong", "em", "br", "a"],
            ALLOWED_ATTR: ["start", "type", "value", "href"],
          }),
        }}
      />
    );
  return (
    <>
      {description
        .split("\n")
        .filter(Boolean)
        .map((paragraph, i) => (
          <p key={i} className={paragraphClassName}>
            {paragraph}
          </p>
        ))}
    </>
  );
};
