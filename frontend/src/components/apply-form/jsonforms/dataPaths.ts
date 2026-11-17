/*
  JSON Forms names a value by its data path, with array indexes as segments: `people.0.bio`.
  The SGG widgets, saving and validation each name it their own way, so these translate.
*/

const segments = (path: string): string[] => path.split(".").filter(Boolean);

const isIndex = (segment: string): boolean => /^\d+$/.test(segment);

/** `people.0.bio` -> `/properties/people/items/properties/bio`, the value's JSON schema. */
export const dataPathToDefinition = (path: string): string =>
  segments(path)
    .map((segment) => (isIndex(segment) ? "/items" : `/properties/${segment}`))
    .join("");

/**
 * `people.0.bio` -> `people[0]--bio`, the HTML field name the save action shapes back into
 * `people[0].bio`. Each list level adds its index: `a.0.b.1.c` -> `a[0]--b[1]--c`.
 */
export const dataPathToHtmlName = (path: string): string =>
  segments(path).reduce(
    (name, segment) =>
      isIndex(segment)
        ? `${name}[${segment}]`
        : name
          ? `${name}--${segment}`
          : segment,
    "",
  );

/** `people.0.bio` -> `$.people[0].bio`, the path the API reports a validation warning at. */
export const dataPathToWarningPath = (path: string): string =>
  `$${segments(path)
    .map((segment) => (isIndex(segment) ? `[${segment}]` : `.${segment}`))
    .join("")}`;

/** The segments of `path` beneath `basePath`: `people.0.name.first` in `people.0` -> `name,first`. */
export const relativeSegments = (path: string, basePath: string): string[] =>
  segments(path).slice(segments(basePath).length);
