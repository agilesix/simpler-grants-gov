import { JSX } from "react";
import { Fieldset, FormGroup } from "@trussworks/react-uswds";

import { SectionDescription } from "./SectionDescription";

export const FieldsetWidget = ({
  label,
  fieldName,
  children,
  description,
  descriptionFormat,
}: {
  label: string;
  fieldName: string;
  children: JSX.Element | undefined;
  description?: string;
  descriptionFormat?: "html";
}) => {
  return (
    <Fieldset key={`${fieldName}-row`} id={`form-section-${fieldName}`}>
      <FormGroup key={`${fieldName}-group`} className="simpler-formgroup">
        <h4
          key={`${fieldName}-legend`}
          className="usa-legend font-sans-lg margin-bottom-05 margin-top-5"
        >
          {label}
        </h4>
        <SectionDescription
          description={description}
          descriptionFormat={descriptionFormat}
        />
        {children}
      </FormGroup>
    </Fieldset>
  );
};
