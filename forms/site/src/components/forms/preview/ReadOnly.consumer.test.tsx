// @vitest-environment jsdom
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";

import { SggFormRenderer } from "./SggFormRenderer";

const schema: JsonSchema = {
  type: "object",
  properties: {
    agency: { type: "string", title: "Agency", readOnly: true },
    signature: {
      type: "object",
      properties: {
        date: {
          type: "string",
          title: "Signed Date",
          format: "date",
          readOnly: true,
        },
      },
    },
    notes: { type: "string", title: "Notes" },
  },
};
const uischema = {
  type: "VerticalLayout",
  elements: [
    { type: "Control", scope: "#/properties/agency" },
    { type: "Control", scope: "#/properties/signature/properties/date" },
    { type: "Control", scope: "#/properties/notes" },
  ],
} as UISchemaElement;
const sample = {
  agency: "Synthetic agency",
  signature: { date: "2026-11-02" },
  notes: "Original",
};
function Preview() {
  const [data, setData] = useState<unknown>(sample);
  return (
    <>
      <SggFormRenderer
        schema={schema}
        uischema={uischema}
        data={data}
        showErrors={false}
        onChange={setData}
      />
      <button onClick={() => setData({})}>Clear preview</button>
      <output data-testid="answers">{JSON.stringify(data)}</output>
    </>
  );
}
afterEach(cleanup);

it("retains disabled system values when an editable answer changes or clears", async () => {
  render(<Preview />);
  fireEvent.input(screen.getByRole("textbox", { name: "Notes" }), {
    target: { value: "true" },
  });
  await act(async () => {});
  expect(
    JSON.parse(screen.getByTestId("answers").textContent ?? "null"),
  ).toEqual({ ...sample, notes: "true" });
  fireEvent.input(screen.getByRole("textbox", { name: "Notes" }), {
    target: { value: "" },
  });
  await act(async () => {});
  expect(
    JSON.parse(screen.getByTestId("answers").textContent ?? "null"),
  ).toEqual({ agency: sample.agency, signature: sample.signature });
});

it("does not resurrect sample values after an explicit external clear", async () => {
  render(<Preview />);
  fireEvent.click(screen.getByRole("button", { name: "Clear preview" }));
  await act(async () => {});
  fireEvent.input(screen.getByRole("textbox", { name: "Notes" }), {
    target: { value: "New" },
  });
  await act(async () => {});
  expect(
    JSON.parse(screen.getByTestId("answers").textContent ?? "null"),
  ).toEqual({ notes: "New" });
});
