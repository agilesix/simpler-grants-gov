import DOMPurify from "isomorphic-dompurify";

// Proposed shared display support for non-answer instructions, demonstrated by ED Abstract.
// Existing descriptions stay plain; HTML is restricted to the prose this example needs.
const instructionHtml = (text: string) =>
  DOMPurify.sanitize(text, {
    ALLOWED_TAGS: ["p", "ul", "ol", "li", "strong", "em", "br"],
    ALLOWED_ATTR: [],
  });

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
        className="section-description"
        dangerouslySetInnerHTML={{ __html: instructionHtml(description) }}
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
