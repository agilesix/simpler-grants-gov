import { FormattedFormValidationWarning } from "src/types/applyForm/types";
import { rebaseFieldListWarningsAfterDelete } from "src/utils/applyForm/rebaseFieldListWarningsAfterDelete";

const warning = (
  field: string,
  htmlField: string,
): FormattedFormValidationWarning => ({
  field,
  htmlField,
  message: "is required",
  type: "required",
  value: null,
});

describe("rebaseFieldListWarningsAfterDelete", () => {
  it("drops the deleted entry's warnings and shifts the later entries' down", () => {
    expect(
      rebaseFieldListWarningsAfterDelete({
        rawErrors: [
          warning("$.people[0].name", "people[0]--name"),
          warning("$.people[1].name", "people[1]--name"),
          warning("$.people[2].name", "people[2]--name"),
        ],
        fieldListPath: "$.people",
        deletedEntryIndex: 1,
      })?.map(({ field, htmlField }) => [field, htmlField]),
    ).toEqual([
      ["$.people[0].name", "people[0]--name"],
      ["$.people[1].name", "people[1]--name"],
    ]);
  });

  it("shifts the inner index when an entry of a list inside a list entry is deleted", () => {
    expect(
      rebaseFieldListWarningsAfterDelete({
        rawErrors: [
          warning(
            "$.people[2].phones[1].number",
            "people[2]--phones[1]--number",
          ),
          warning(
            "$.people[1].phones[1].number",
            "people[1]--phones[1]--number",
          ),
        ],
        fieldListPath: "$.people[2].phones",
        deletedEntryIndex: 0,
      })?.map(({ field, htmlField }) => [field, htmlField]),
    ).toEqual([
      ["$.people[2].phones[0].number", "people[2]--phones[0]--number"],
      ["$.people[1].phones[1].number", "people[1]--phones[1]--number"],
    ]);
  });

  it("shifts the warnings of a list inside the entries that move up", () => {
    expect(
      rebaseFieldListWarningsAfterDelete({
        rawErrors: [
          warning(
            "$.people[2].phones[1].number",
            "people[2]--phones[1]--number",
          ),
        ],
        fieldListPath: "$.people",
        deletedEntryIndex: 0,
      })?.map(({ field, htmlField }) => [field, htmlField]),
    ).toEqual([
      ["$.people[1].phones[1].number", "people[1]--phones[1]--number"],
    ]);
  });

  it("shifts the warnings of a list inside an object", () => {
    expect(
      rebaseFieldListWarningsAfterDelete({
        rawErrors: [
          warning(
            "$.budget.line_items[1].amount",
            "budget--line_items[1]--amount",
          ),
        ],
        fieldListPath: "$.budget.line_items",
        deletedEntryIndex: 0,
      })?.map(({ field, htmlField }) => [field, htmlField]),
    ).toEqual([
      ["$.budget.line_items[0].amount", "budget--line_items[0]--amount"],
    ]);
  });

  it("keeps a warning on an entry's object pointed at the field it names", () => {
    expect(
      rebaseFieldListWarningsAfterDelete({
        rawErrors: [warning("$.people[2].address", "people[2]--address--city")],
        fieldListPath: "$.people",
        deletedEntryIndex: 0,
      })?.map(({ field, htmlField }) => [field, htmlField]),
    ).toEqual([["$.people[1].address", "people[1]--address--city"]]);
  });
});
