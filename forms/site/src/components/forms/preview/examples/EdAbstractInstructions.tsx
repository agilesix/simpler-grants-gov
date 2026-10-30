import { useState } from "react";

import { JsonFormsFields } from "../../../../vendor/sgg/JsonFormsFields";
import { previewRenderers } from "../renderers";
import { schema, uiSchema } from "./edAbstractFixture";

const emptyAnswer = {};

/** One display experiment in the existing preview; no services, answer model or emitter. */
export default function EdAbstractInstructions() {
  const [rich, setRich] = useState(true);
  const [librarySection, setLibrarySection] = useState(true);
  return (
    <>
      <div className="display-flex flex-wrap flex-align-center gap-2 margin-bottom-3">
        <fieldset className="usa-fieldset">
          <legend className="usa-legend font-sans-sm">Instructions</legend>
          <button
            className={`usa-button ${rich ? "usa-button--outline" : ""}`}
            type="button"
            aria-pressed={!rich}
            onClick={() => setRich(false)}
          >
            Plain baseline
          </button>
          <button
            className={`usa-button ${rich ? "" : "usa-button--outline"}`}
            type="button"
            aria-pressed={rich}
            onClick={() => setRich(true)}
          >
            Formatted candidate
          </button>
        </fieldset>
        <label>
          Section renderer
          <select
            className="usa-select margin-top-05"
            value={librarySection ? "library" : "adapter"}
            onChange={(event) =>
              setLibrarySection(event.target.value === "library")
            }
          >
            <option value="library">Library preview override</option>
            <option value="adapter">Existing adapter fieldset</option>
          </select>
        </label>
      </div>
      <p className="usa-hint">
        {rich ? "Proposed HTML opt-in" : "Existing plain-text behavior"} ·{" "}
        {librarySection
          ? "FormSection"
          : "FieldsetWidget via the library adapter"}
        . The attachment is disabled: this example tests instruction display,
        not upload services.
      </p>
      <form
        className="simpler-apply-form ed-instructions-example"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2>ED Abstract Form</h2>
        <JsonFormsFields
          errors={null}
          formData={emptyAnswer}
          schema={schema}
          uiSchema={uiSchema(rich)}
          isFormLocked
          extraRenderers={librarySection ? previewRenderers : []}
        />
      </form>
    </>
  );
}
