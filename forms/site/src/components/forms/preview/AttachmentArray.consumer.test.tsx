// @vitest-environment jsdom
import type { JsonSchema7, UISchemaElement } from "@jsonforms/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { SggFormRenderer } from "./SggFormRenderer";

const FIRST = "00b9001b-6ca8-4c0c-9328-46f39e9ff14b";
const SECOND = "c8eebbcc-a6ec-4b20-9bfa-e6bcc5abb6d5";
const sample = () => ({ attachments: [FIRST, SECOND] });
const schema: JsonSchema7 = {
  type: "object",
  required: ["attachments"],
  properties: {
    attachments: {
      type: "array",
      title: "Files",
      minItems: 1,
      maxItems: 100,
      items: { type: "string", format: "uuid" },
    },
    notes: { type: "string", title: "Notes" },
  },
};
const uischema: UISchemaElement = {
  type: "VerticalLayout",
  elements: [
    {
      type: "Control",
      scope: "#/properties/attachments",
      options: { widget: "AttachmentArray" },
    },
    {
      type: "Control",
      scope: "#/properties/notes",
      options: { widget: "Text" },
    },
  ],
} as UISchemaElement;

function Preview() {
  const [data, setData] = useState<unknown>(sample);
  const [checked, setChecked] = useState(false);
  return (
    <>
      <SggFormRenderer
        schema={schema}
        uischema={uischema}
        data={data}
        showErrors={checked}
        onChange={setData}
      />
      <button onClick={() => setData({})}>Clear preview</button>
      <button onClick={() => setData(sample())}>Load preview</button>
      <button
        onClick={() => {
          setData(structuredClone(data));
          setChecked(true);
        }}
      >
        Check preview
      </button>
      <output data-testid="answers">{JSON.stringify(data)}</output>
    </>
  );
}
const answers = () =>
  JSON.parse(screen.getByTestId("answers").textContent ?? "null");
async function removeFirst() {
  fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
  fireEvent.click(screen.getByRole("button", { name: "Delete file" }));
  await act(async () => {});
}
// jsdom has no layout; supply geometry only so the real modal's focus trap can run.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 10, height: 10 },
  ] as unknown as DOMRectList);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("publishes removal from the actual attachment widget without a sibling edit", async () => {
  render(<Preview />);
  await removeFirst();
  expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(1);
  expect(answers().attachments).toEqual([SECOND]);
});

it("does not resurrect deleted references when checking the now-empty list", async () => {
  render(<Preview />);
  await removeFirst();
  await removeFirst();
  expect(answers().attachments).toEqual([]);
  fireEvent.click(screen.getByRole("button", { name: "Check preview" }));
  await act(async () => {});
  expect(answers().attachments).toEqual([]);
  expect(screen.queryAllByRole("button", { name: "Delete" })).toHaveLength(0);
});

it("preserves external clear and reload instead of collecting an older widget generation", async () => {
  render(<Preview />);
  fireEvent.click(screen.getByRole("button", { name: "Clear preview" }));
  await act(async () => {});
  expect(answers()).toEqual({});
  fireEvent.click(screen.getByRole("button", { name: "Load preview" }));
  await act(async () => {});
  expect(answers()).toEqual(sample());
});

it("continues to collect an ordinary text edit", async () => {
  render(<Preview />);
  fireEvent.input(screen.getByRole("textbox", { name: "Notes" }), {
    target: { value: "Supporting files" },
  });
  await act(async () => {});
  expect(answers()).toEqual({ ...sample(), notes: "Supporting files" });
});
