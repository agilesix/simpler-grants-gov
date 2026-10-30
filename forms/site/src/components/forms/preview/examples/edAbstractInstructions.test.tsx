import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JsonFormsFields } from "../../../../vendor/sgg/JsonFormsFields";
import { previewRenderers } from "../renderers";
import { plainInstructions, schema, uiSchema } from "./edAbstractFixture";

/** Exercise actual description consumers without adding a second browser test harness. */
describe("ED Abstract instruction design example", () => {
  for (const librarySection of [false, true]) {
    const owner = librarySection ? "library section" : "adapter fieldset";
    const show = (rich: boolean) =>
      renderToStaticMarkup(
        createElement(JsonFormsFields, {
          errors: null,
          formData: {},
          schema,
          uiSchema: uiSchema(rich),
          isFormLocked: true,
          extraRenderers: librarySection ? previewRenderers : [],
        }),
      );

    it(`${owner}: carries the format through to the real description owner`, () => {
      const markup = show(true);
      const lists = [...markup.matchAll(/<ul>(.*?)<\/ul>/gs)];
      expect(
        lists.map((list) => [...list[1].matchAll(/<li>/g)].length),
      ).toEqual([5, 3]);
      const renderedText = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      for (const paragraph of plainInstructions.split("\n\n"))
        expect(renderedText).toContain(paragraph.replace(/^• /, ""));
      expect([...markup.matchAll(/name="attachment"/g)]).toHaveLength(1);
      expect(Object.keys(schema.properties)).toEqual(["attachment"]);
    });

    it(`${owner}: leaves the plain baseline escaped with no semantic list`, () => {
      const markup = show(false);
      expect(markup).not.toContain("<ul>");
      expect(markup).toContain("• Abstracts must not exceed one page");
    });
  }
});
