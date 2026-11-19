"use client";

import {
  and,
  isControl,
  or,
  rankWith,
  uiTypeIs,
  type ControlElement,
  type ControlProps,
  type GroupLayout,
  type JsonFormsRendererRegistryEntry,
  type JsonSchema,
  type LayoutProps,
} from "@jsonforms/core";
import {
  JsonFormsDispatch,
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from "@jsonforms/react";
import type { RJSFSchema } from "@rjsf/utils";
import { get } from "lodash";
import type {
  BroadlyDefinedWidgetValue,
  FieldListEntryRenderProps,
  FieldListGroupItem,
  FormattedFormValidationWarning,
  GeneralRecord,
  UiSchemaField,
} from "src/types/applyForm/types";
import { addPrintWidgetToFields } from "src/utils/applyForm/applyFormUtils";
import { getFieldListChildErrors } from "src/utils/applyForm/fieldListHelpers";
import { getFieldConfig } from "src/utils/applyForm/getFieldConfig";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { Fieldset } from "@trussworks/react-uswds";

import {
  renderFieldNode,
  type RenderFieldNodeProps,
} from "src/components/apply-form/FormFields";
import FieldListWidget from "src/components/apply-form/widgets/FieldListWidget";
import {
  renderWidget,
  wrapSection,
} from "src/components/apply-form/widgets/WidgetRenderers";
import {
  controlToNodes,
  entryLayout,
  groupName,
  listItemSchema,
  type JsonFormsUiSchema,
} from "./convertUiSchema";
import {
  dataPathToDefinition,
  dataPathToHtmlName,
  dataPathToWarningPath,
  relativeSegments,
} from "./dataPaths";

/*
  JSON Forms supplies layout and rule evaluation; everything it renders is one of our widgets.
  The props a widget needs -- saved values, warnings, the form context -- are ours rather
  than JSON Forms', so they travel through this context instead of JSON Forms' own state.
*/
export type AdapterContextValue = {
  schema: RJSFSchema;
  formData: object;
  errors: FormattedFormValidationWarning[] | null;
  requiredFieldPaths: string[];
  rootUiSchema: JsonFormsUiSchema;
  formContext?: RenderFieldNodeProps["formContext"];
  isFormLocked?: boolean;
  print?: boolean;
  /** Re-read the rule data from the form after its next render, e.g. after an entry is removed. */
  requestRuleDataRefresh: () => void;
};

export const AdapterContext = createContext<AdapterContextValue | null>(null);

/**
 * The list entry that contains a control. Fields in the entry read their values from the
 * field-list widget's copy of the entry and send changes to it, like the widget's own fields.
 */
type ListEntry = FieldListEntryRenderProps & {
  /** The entry's JSON Forms data path, e.g. `contacts.0`. */
  path: string;
  /** The list's validation path, e.g. `$.contacts`. */
  listWarningPath: string;
  itemSchema: RJSFSchema;
};

const ListEntryContext = createContext<ListEntry | null>(null);

const useAdapterContext = (): AdapterContextValue => {
  const value = useContext(AdapterContext);
  if (!value) {
    throw new Error("JSON Forms renderers must be used inside JsonFormsFields");
  }
  return value;
};

/**
 * A JSON Forms control, rendered by the widget the equivalent section/field node would get.
 * `visible` and `enabled` are JSON Forms' evaluation of the control's rule.
 */
const AdaptedControl = ({ uischema, path, visible, enabled }: ControlProps) => {
  const context = useAdapterContext();
  const entry = useContext(ListEntryContext);
  if (!visible) return null;

  // Read the control at its data path, since inside a list entry its scope is relative to the entry.
  const control = entry
    ? { ...uischema, scope: `#${dataPathToDefinition(path)}` }
    : uischema;
  const nodes = controlToNodes(control, context.schema);
  const rendered = context.print ? addPrintWidgetToFields(nodes) : nodes;

  return (
    <>
      {rendered.map((node) => {
        if (node.type === "section" || node.type === "text") return null;
        if (entry) {
          return node.type === "fieldList"
            ? null
            : renderEntryField({ node, entry, context, enabled });
        }
        return renderFieldNode({
          node,
          schema: context.schema,
          errors: context.errors,
          formData: context.formData,
          requiredFieldPaths: context.requiredFieldPaths,
          formContext: context.formContext,
          isFormLocked: context.isFormLocked,
          disabled: !enabled,
        });
      })}
    </>
  );
};

/**
 * A layout. A labeled group is a section, rendered with the same fieldset the SGG renderer
 * uses; the root layout is the form itself, whose title the page already shows.
 */
const AdaptedLayout = ({
  uischema,
  schema,
  path,
  enabled,
  visible,
  renderers,
  cells,
}: LayoutProps) => {
  const context = useAdapterContext();
  const entry = useContext(ListEntryContext);
  if (!visible) return null;

  const layout = uischema as GroupLayout;
  // Key by position alone, so removing an entry doesn't remount the entries after it.
  const children = layout.elements.map((element, index) => (
    <JsonFormsDispatch
      key={index}
      uischema={element}
      schema={schema}
      path={path}
      enabled={enabled}
      renderers={renderers}
      cells={cells}
    />
  ));

  if (uischema === context.rootUiSchema || !layout.label) {
    return <>{children}</>;
  }
  const description = layout.options?.description as string | undefined;
  if (entry) {
    return (
      <EntryGroup label={layout.label} description={description}>
        {children}
      </EntryGroup>
    );
  }
  return wrapSection({
    label: layout.label,
    fieldName: groupName(layout.label),
    sectionFields: <>{children}</>,
    description,
  });
};

/**
 * Render a labeled group inside a list entry as a sub-section, headed one level below the
 * entry's heading. Leave off the id a form section has, since every entry repeats the group.
 */
const EntryGroup = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) => (
  <Fieldset className="margin-top-3">
    <legend className="usa-legend text-bold margin-top-0">{label}</legend>
    {description
      ?.split("\n")
      .filter(Boolean)
      .map((paragraph, index) => (
        <p key={index} className="usa-hint">
          {paragraph}
        </p>
      ))}
    {children}
  </Fieldset>
);

/**
 * Render one field in a list entry with the same HTML name (e.g. `contacts[1]--address--city`),
 * value, warnings and required state that the field-list widget gives its own fields.
 */
const renderEntryField = ({
  node,
  entry,
  context,
  enabled,
}: {
  node: UiSchemaField;
  entry: ListEntry;
  context: AdapterContextValue;
  enabled: boolean;
}) => {
  const definition = node.definition;
  if (typeof definition !== "string") return null;
  const config = getFieldConfig({
    uiFieldObject: node,
    formSchema: context.schema,
    errors: null,
    formData: {},
    requiredField: false,
  });
  if (config.type === "FieldList") return null;

  const storagePath = definition
    .slice(dataPathToDefinition(entry.path).length)
    .split("/")
    .filter((segment) => segment && segment !== "properties");
  const name = `${dataPathToHtmlName(entry.path)}--${storagePath.join("--")}`;

  return renderWidget({
    type: config.type,
    props: {
      ...config.props,
      id: name,
      name,
      key: `${entry.entryId}-${storagePath.join("--")}`,
      value: get(entry.entryValue, storagePath) as
        BroadlyDefinedWidgetValue | undefined,
      rawErrors: getFieldListChildErrors({
        rawErrors: context.errors ?? undefined,
        fieldListPath: entry.listWarningPath,
        entryIndex: entry.entryIndex,
        storagePath,
        childDefinition: definition,
      }),
      required: isRequiredInEntry(entry.itemSchema, storagePath),
      updateOnInput: true,
      additionalDescribedById: entry.entryHeadingId,
      disabled:
        Boolean(config.props.disabled) ||
        !enabled ||
        entry.isInteractionDisabled,
      readOnly: entry.isInteractionDisabled,
      isFormLocked: context.isFormLocked || entry.isInteractionDisabled,
      formContext: context.formContext,
      onChange: (nextValue) => entry.onFieldChange(storagePath, nextValue),
    },
    definition,
  });
};

/** Return whether the entry requires a field, i.e. every property on its path is required. */
const isRequiredInEntry = (
  itemSchema: RJSFSchema,
  storagePath: string[],
): boolean => {
  let schema: RJSFSchema | undefined = itemSchema;
  for (const segment of storagePath) {
    if (!schema?.required?.includes(segment)) return false;
    schema = schema.properties?.[segment] as RJSFSchema | undefined;
  }
  return true;
};

const NO_GROUP_DEFINITION: FieldListGroupItem[] = [];

/**
 * Render a list of objects with the SGG field-list widget, which provides the headings and
 * the add and delete buttons. Render each entry's layout with JSON Forms at the entry's path,
 * so rules in the entry apply to that entry, labeled groups become sub-sections, and a list
 * inside the entry renders as a nested list.
 */
const AdaptedList = ({
  uischema,
  schema,
  path,
  visible,
  enabled,
  renderers,
  cells,
}: ControlProps) => {
  const context = useAdapterContext();
  const entry = useContext(ListEntryContext);
  const value: unknown = entry
    ? get(entry.entryValue, relativeSegments(path, entry.path))
    : get(context.formData, path);
  // Start with the number of saved entries, or minItems if that is larger.
  const entryCount = useRef(
    Math.max(Array.isArray(value) ? value.length : 0, schema.minItems ?? 0),
  );
  if (!visible) return null;

  const itemSchema = (schema as RJSFSchema).items as RJSFSchema;
  const options = (uischema.options ?? {}) as {
    description?: string;
    readonly?: boolean;
  };
  const detail = entryLayout(uischema, itemSchema, options.readonly);
  const label =
    (typeof uischema.label === "string" ? uischema.label : undefined) ??
    schema.title ??
    path.split(".").pop() ??
    path;
  const description = options.description ?? schema.description;
  const listWarningPath = dataPathToWarningPath(path);

  return (
    <FieldListWidget
      key={path}
      id={dataPathToHtmlName(path)}
      schema={{ type: "array", title: label, description }}
      label={label}
      description={description}
      // Pass the list's validation path as the name, since the widget reads its warnings at `$.<name>`.
      name={listWarningPath.slice(2)}
      minItems={schema.minItems}
      maxItems={schema.maxItems}
      groupDefinition={NO_GROUP_DEFINITION}
      rawErrors={context.errors ?? []}
      value={Array.isArray(value) ? (value as GeneralRecord[]) : undefined}
      disabled={!enabled || entry?.isInteractionDisabled}
      isFormLocked={context.isFormLocked}
      formContext={context.formContext}
      onChange={(nextValue) => {
        // Re-read the rule data when an entry is added or removed, since rules read entries by index.
        const count = Array.isArray(nextValue) ? nextValue.length : 0;
        if (count !== entryCount.current) context.requestRuleDataRefresh();
        entryCount.current = count;
      }}
      renderEntry={(entryProps) => {
        const entryPath = `${path}.${entryProps.entryIndex}`;
        return (
          <ListEntryContext.Provider
            value={{
              ...entryProps,
              path: entryPath,
              listWarningPath,
              itemSchema,
            }}
          >
            <JsonFormsDispatch
              uischema={detail}
              schema={itemSchema as JsonSchema}
              path={entryPath}
              enabled={enabled}
              renderers={renderers}
              cells={cells}
            />
          </ListEntryContext.Provider>
        );
      }}
    />
  );
};

const ADAPTER_RANK = 10;

/* Rank above the adapter, which would otherwise show a list with the field-list widget's own fields. */
const LIST_RANK = 11;

/*
  Ranked below the adapter, so it only matches a control that other widgets can't render, and skips it
  instead of showing "No applicable renderer found". prepareJsonFormsUiSchema logs each one.
*/
const SKIP_RANK = 1;

const SkipControl = () => null;

/*
  Read each control against the schema it's dispatched with: the form's, or an entry's item
  schema for a control inside a list entry, whose scope is relative to the entry.
*/
export const adaptedControlTester = rankWith(
  ADAPTER_RANK,
  and(
    isControl,
    (uischema, schema) =>
      controlToNodes(uischema as ControlElement, schema as RJSFSchema).length >
      0,
  ),
);

export const adaptedListTester = rankWith(
  LIST_RANK,
  and(
    isControl,
    (uischema, schema) =>
      !!listItemSchema(uischema as ControlElement, schema as RJSFSchema),
  ),
);

export const adaptedLayoutTester = rankWith(
  ADAPTER_RANK,
  or(
    uiTypeIs("Group"),
    uiTypeIs("VerticalLayout"),
    uiTypeIs("HorizontalLayout"),
  ),
);

export const renderers: JsonFormsRendererRegistryEntry[] = [
  {
    tester: rankWith(SKIP_RANK, isControl),
    renderer: SkipControl,
  },
  {
    tester: adaptedControlTester,
    renderer: withJsonFormsControlProps(AdaptedControl),
  },
  {
    tester: adaptedListTester,
    renderer: withJsonFormsControlProps(AdaptedList),
  },
  {
    tester: adaptedLayoutTester,
    renderer: withJsonFormsLayoutProps(AdaptedLayout),
  },
];
