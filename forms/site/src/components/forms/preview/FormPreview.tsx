import type { JsonSchema, UISchemaElement } from "@jsonforms/core";
import { useStore } from "@nanostores/react";
import { useCallback, useState } from "react";

import { FormRenderer } from ".";
import { $previewData } from "../../../stores/formPreview";

interface Props {
  schema: JsonSchema;
  uischema: UISchemaElement;
  /** The form's first `@example` from the TypeSpec. */
  example?: Record<string, unknown>;
}

/** An interactive form, starting empty; the data it produces is shown in the Data tab. */
export default function FormPreview({ schema, uischema, example }: Props) {
  const data = useStore($previewData);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const onChange = useCallback((next: unknown, nextWarnings: string[]) => {
    $previewData.set(next);
    setWarnings(nextWarnings);
  }, []);

  const reset = (next: unknown) => {
    $previewData.set(next);
    setShowErrors(false);
  };

  return (
    <div className="form-preview">
      <div className="form-preview__actions">
        {example && (
          <button
            type="button"
            className="usa-button"
            onClick={() => reset(structuredClone(example))}
          >
            Load sample data
          </button>
        )}
        <button
          type="button"
          className="usa-button usa-button--outline"
          onClick={() => reset({})}
        >
          Clear
        </button>
        <button
          type="button"
          className="usa-button usa-button--secondary"
          onClick={() => {
            // A fresh copy makes the renderer re-check what is in the form now.
            $previewData.set(structuredClone(data));
            setShowErrors(true);
          }}
        >
          Check for errors
        </button>
      </div>

      {showErrors && (
        <div
          className={`usa-alert usa-alert--slim ${warnings.length ? "usa-alert--warning" : "usa-alert--success"}`}
          role="status"
        >
          <div className="usa-alert__body">
            {warnings.length ? (
              <>
                <p className="usa-alert__text">
                  {warnings.length}{" "}
                  {warnings.length === 1 ? "field needs" : "fields need"}{" "}
                  attention:
                </p>
                <ul className="usa-list">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="usa-alert__text">No errors found.</p>
            )}
          </div>
        </div>
      )}

      <div className="form-preview__form">
        <FormRenderer
          schema={schema}
          uischema={uischema}
          data={data}
          showErrors={showErrors}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
