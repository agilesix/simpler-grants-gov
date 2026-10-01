"use client";

import { JsonForms } from "@jsonforms/react";
import {
  JsonFormsStyleContext,
  vanillaCells,
  vanillaStyles,
} from "@jsonforms/vanilla-renderers";
import { RJSFSchema } from "@rjsf/utils";
import { FormattedFormValidationWarning } from "src/types/applyForm/types";
import {
  getRequiredProperties,
  shapeFormData,
} from "src/utils/applyForm/applyFormUtils";
import { JsonFormsUiSchema } from "src/utils/applyForm/jsonFormsUiSchema";

import { FormEvent, useCallback, useMemo, useState } from "react";

import { RootBudgetFormContext } from "src/components/apply-form/FormFields";
import { AdapterContext, AdapterContextValue, renderers } from "./renderers";

// USWDS classes for the few elements the vanilla fallback renderers draw.
const uswdsStyles = [
  ...vanillaStyles,
  { name: "control.input", classNames: ["usa-input"] },
  { name: "control.select", classNames: ["usa-select"] },
  { name: "control.label", classNames: ["usa-label"] },
  { name: "control.validation", classNames: ["usa-error-message"] },
];

/**
 * The body of a form whose UI schema is JSON Forms. Takes the same props as `FormFields`
 * and renders into the same `<form>`, so saving is unchanged: every widget still submits
 * under its own field name and the save action shapes the FormData as it always has.
 *
 * JSON Forms keeps its own copy of the data only to evaluate rules. It is refreshed from
 * the form on every input, so a field enabled by another field's answer changes as soon
 * as that answer does.
 */
export const JsonFormsFields = ({
  errors,
  formData,
  schema,
  uiSchema,
  formContext,
  isFormLocked,
  print,
}: {
  errors: FormattedFormValidationWarning[] | null;
  formData: object;
  schema: RJSFSchema;
  uiSchema: JsonFormsUiSchema;
  formContext?: RootBudgetFormContext;
  isFormLocked?: boolean;
  print?: boolean;
}) => {
  const [ruleData, setRuleData] = useState<object>(formData);

  const adapterContext = useMemo<AdapterContextValue>(
    () => ({
      schema,
      formData,
      errors,
      requiredFieldPaths: getRequiredProperties(schema),
      rootUiSchema: uiSchema,
      formContext,
      isFormLocked,
      print,
    }),
    [schema, formData, errors, uiSchema, formContext, isFormLocked, print],
  );

  const refreshRuleData = useCallback(
    (event: FormEvent<HTMLDivElement>) => {
      const form = event.currentTarget.closest("form");
      if (form) setRuleData(shapeFormData(new FormData(form), schema));
    },
    [schema],
  );

  return (
    <AdapterContext.Provider value={adapterContext}>
      <JsonFormsStyleContext.Provider value={{ styles: uswdsStyles }}>
        <div onInput={refreshRuleData} onChange={refreshRuleData}>
          <JsonForms
            schema={schema as object}
            uischema={uiSchema}
            data={ruleData}
            renderers={renderers}
            cells={vanillaCells}
            readonly={isFormLocked || print}
            validationMode="NoValidation"
          />
        </div>
      </JsonFormsStyleContext.Provider>
    </AdapterContext.Provider>
  );
};
