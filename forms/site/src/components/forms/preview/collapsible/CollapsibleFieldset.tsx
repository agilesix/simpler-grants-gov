import type { SummaryItem } from "@/lib/collapsible";
import {
  Resolve,
  toDataPath,
  type ControlElement,
  type GroupLayout,
  type JsonSchema,
  type LayoutProps,
  type UISchemaElement,
} from "@jsonforms/core";
import { JsonFormsDispatch, useJsonForms } from "@jsonforms/react";
import { isFieldRequired } from "@sgg/frontend/utils/applyForm/applyFormUtils";
import { useContext, useState } from "react";

import { groupName } from "../../../../vendor/sgg/jsonFormsUiSchema";
import { AdapterContext } from "../../../../vendor/sgg/renderers";
import CollapsibleHeader from "./CollapsibleHeader";
import SummaryList from "./SummaryList";

const controlsIn = (element: UISchemaElement): ControlElement[] =>
  element.type === "Control"
    ? [element as ControlElement]
    : "elements" in element && Array.isArray(element.elements)
      ? (element.elements as UISchemaElement[]).flatMap(controlsIn)
      : [];

/** Each leaf beneath a scope, so a control scoped to an object lists every field in it. */
const leafScopes = (scope: string, root: JsonSchema): string[] => {
  const schema = Resolve.schema(root, scope, root);
  return schema?.properties
    ? Object.keys(schema.properties).flatMap((name) =>
        leafScopes(`${scope}/properties/${name}`, root),
      )
    : [scope];
};

/** The answers a group holds, read from JSON Forms' copy of the form data. */
function groupItems(
  layout: GroupLayout,
  root: JsonSchema,
  data: unknown,
  requiredPaths: string[],
): SummaryItem[] {
  return controlsIn(layout).flatMap((control) =>
    leafScopes(control.scope, root).map((scope) => {
      const schema = Resolve.schema(root, scope, root) as JsonSchema & {
        oneOf?: { const?: unknown; title?: string }[];
      };
      const single = scope === control.scope;
      return {
        label:
          (single && typeof control.label === "string"
            ? control.label
            : undefined) ??
          schema?.title ??
          scope.split("/").pop() ??
          scope,
        value: Resolve.data(data, toDataPath(scope)),
        required: isFieldRequired(scope.slice(1), requiredPaths),
        enumOptions: schema?.oneOf
          ?.filter((option) => option.title !== undefined)
          .map((option) => ({ value: option.const, label: option.title! })),
      };
    }),
  );
}

/**
 * A group drawn as the SGG fieldset is, with a header that collapses it to a read-only list
 * of its answers. Its fields stay mounted while collapsed, so the form still submits them.
 */
export default function CollapsibleFieldset({
  uischema,
  schema,
  path,
  enabled,
  visible,
  renderers,
  cells,
}: LayoutProps) {
  const context = useContext(AdapterContext);
  const { core } = useJsonForms();
  const layout = uischema as GroupLayout;
  const items = groupItems(
    layout,
    (core?.schema ?? schema) as JsonSchema,
    core?.data,
    context?.requiredFieldPaths ?? [],
  );
  // Starts collapsed once it has answers, the way a reviewer would first see it.
  const [collapsed, setCollapsed] = useState(() =>
    items.some((item) => item.value !== undefined && item.value !== ""),
  );
  if (!visible) return null;

  const label = layout.label ?? "";
  return (
    <fieldset
      className={`usa-fieldset collapsible collapsible--fieldset${collapsed ? "" : " collapsible--open"}`}
      id={`form-section-${groupName(label)}`}
    >
      <CollapsibleHeader
        title={<span className="collapsible__title">{label}</span>}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      {collapsed && <SummaryList items={items} />}
      <div className="collapsible__body" hidden={collapsed}>
        {layout.elements.map((element, index) => (
          <JsonFormsDispatch
            key={`${path}-${index}`}
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        ))}
      </div>
    </fieldset>
  );
}
