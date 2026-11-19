/*
  Convert between the formats that name a value. JSON Forms uses a data path with array
  indexes as segments (`people.0.bio`); the SGG widgets, shapeFormData and the API's
  validation warnings each use a different format.
*/

const segments = (path: string): string[] => path.split(".").filter(Boolean);

const isIndex = (segment: string): boolean => /^\d+$/.test(segment);

/** Convert `people.0.bio` to `/properties/people/items/properties/bio`, the value's JSON schema definition. */
export const dataPathToDefinition = (path: string): string =>
  segments(path)
    .map((segment) => (isIndex(segment) ? "/items" : `/properties/${segment}`))
    .join("");

/**
 * Convert `/properties/budget/properties/line_items` to `budget.line_items`, the data path of a
 * value that isn't inside a list.
 */
export const definitionToDataPath = (definition: string): string =>
  definition
    .split("/")
    .filter((segment) => segment && segment !== "properties")
    .join(".");

/**
 * Convert `people.0.bio` to `people[0]--bio`, the HTML field name, which shapeFormData converts
 * back to `people[0].bio`. Add an index for each list level: `a.0.b.1.c` -> `a[0]--b[1]--c`.
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

/** Convert `people.0.bio` to `$.people[0].bio`, the path format of the API's validation warnings. */
export const dataPathToWarningPath = (path: string): string =>
  `$${segments(path)
    .map((segment) => (isIndex(segment) ? `[${segment}]` : `.${segment}`))
    .join("")}`;

/** Return the segments of `path` beneath `basePath`: `people.0.name.first` in `people.0` -> `name,first`. */
export const relativeSegments = (path: string, basePath: string): string[] =>
  segments(path).slice(segments(basePath).length);
