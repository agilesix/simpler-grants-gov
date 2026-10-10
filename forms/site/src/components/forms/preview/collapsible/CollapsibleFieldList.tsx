import {
  entryFields,
  entryLayout,
  entryTitle,
  type EntryNode,
  type SummaryItem,
} from "@/lib/collapsible";
import type { ControlProps, UISchemaElement } from "@jsonforms/core";
import { renderWidget } from "@sgg/frontend/components/apply-form/widgets/WidgetRenderers";
import type { FormattedFormValidationWarning } from "@sgg/frontend/types/applyForm/types";
import { isFieldRequired } from "@sgg/frontend/utils/applyForm/applyFormUtils";
import { getFieldListChildErrors } from "@sgg/frontend/utils/applyForm/fieldListHelpers";
import { getFieldConfig } from "@sgg/frontend/utils/applyForm/getFieldConfig";
import { useContext, useRef, useState } from "react";

import { controlToNodes } from "../../../../vendor/sgg/jsonFormsUiSchema";
import { AdapterContext } from "../../../../vendor/sgg/renderers";
import CollapsibleHeader from "./CollapsibleHeader";
import SummaryList from "./SummaryList";

type Value = Record<string, unknown>;

/** One child field of the list, as `getFieldConfig` describes it for the stock FieldList. */
interface ListItem {
  widget: string;
  generalProps: Record<string, unknown> & {
    schema?: { title?: string };
    options?: { enumOptions?: { value: unknown; label: string }[] };
  };
  baseId: string;
  definition: string;
  storagePath: string[];
}

interface ListProps {
  name: string;
  label?: string;
  description?: string;
  minItems?: number;
  maxItems?: number;
  groupDefinition: ListItem[];
  value?: Value[];
  rawErrors?: FormattedFormValidationWarning[];
  requiredFields?: string[];
  detail?: UISchemaElement;
  disabled?: boolean;
}

interface Entry {
  id: number;
  value: Value;
  collapsed: boolean;
}

const INDEX_TOKEN = "~~index~~";

const valueAt = (value: Value, path: string[]): unknown =>
  path.reduce<unknown>(
    (current, part) =>
      current && typeof current === "object" && !Array.isArray(current)
        ? (current as Value)[part]
        : undefined,
    value,
  );

const withValueAt = (
  value: Value,
  [head, ...rest]: string[],
  next: unknown,
): Value => {
  if (!head) return value;
  if (!rest.length) return { ...value, [head]: next };
  const nested = value[head];
  return {
    ...value,
    [head]: withValueAt(
      nested && typeof nested === "object" && !Array.isArray(nested)
        ? (nested as Value)
        : {},
      rest,
      next,
    ),
  };
};

const ATTACHMENTS = new Set(["Attachment", "AttachmentArray"]);

/**
 * A FieldList whose entries each collapse to a read-only list of their answers, and whose
 * entries draw the groups their layout gives them (Name, Address) rather than one run of
 * fields. Entries are stored and named exactly as the stock FieldList stores them, so the
 * form saves the same data.
 */
function CollapsibleFieldList({
  name,
  label = "Entry",
  description,
  minItems = 0,
  maxItems,
  groupDefinition,
  value,
  rawErrors,
  requiredFields = [],
  detail,
  disabled = false,
}: ListProps) {
  const nextId = useRef(0);
  const entry = (entryValue: Value): Entry => ({
    id: nextId.current++,
    value: entryValue,
    collapsed: Object.keys(entryValue).length > 0,
  });
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = (Array.isArray(value) ? value : []).map(entry);
    while (saved.length < minItems) saved.push(entry({}));
    return saved;
  });
  const update = (id: number, change: (entry: Entry) => Entry) =>
    setEntries((current) => current.map((e) => (e.id === id ? change(e) : e)));

  const layout = entryLayout(detail, groupDefinition);
  const listPath = `$.${name}`;
  const canAdd =
    !disabled && (maxItems === undefined || entries.length < maxItems);
  const canDelete = !disabled && entries.length > minItems;

  return (
    <div
      id={name}
      className="field-list-widget collapsible-list border border-base-lighter radius-md padding-2 margin-y-2"
    >
      <div className="collapsible-list__heading">
        <h3 className="margin-0">{label}</h3>
        {maxItems !== undefined && (
          <span className="collapsible-list__count">
            {entries.length} of {maxItems} entries
          </span>
        )}
      </div>
      {description && <p>{description}</p>}

      {entries.map((current, index) => {
        const headingId = `${name}-entry-${index + 1}-heading`;
        const errorsFor = (item: ListItem) =>
          getFieldListChildErrors({
            rawErrors,
            fieldListPath: listPath,
            entryIndex: index,
            storagePath: item.storagePath,
            childDefinition: item.definition,
          });
        const summaryOf = (
          item: ListItem,
        ): SummaryItem & { storagePath: string[] } => ({
          label:
            item.generalProps.schema?.title ?? item.storagePath.at(-1) ?? "",
          value: valueAt(current.value, item.storagePath),
          required: isFieldRequired(item.definition, requiredFields),
          enumOptions: item.generalProps.options?.enumOptions,
          attachment: ATTACHMENTS.has(item.widget),
          storagePath: item.storagePath,
        });
        const renderItem = (item: ListItem) => {
          const id = item.baseId.replace(INDEX_TOKEN, String(index));
          return renderWidget({
            type: item.widget,
            props: {
              ...item.generalProps,
              id,
              name: id,
              key: `${current.id}-${item.storagePath.join(".")}`,
              value: valueAt(current.value, item.storagePath),
              rawErrors: errorsFor(item),
              required: isFieldRequired(item.definition, requiredFields),
              updateOnInput: true,
              additionalDescribedById: headingId,
              disabled,
              readOnly: disabled,
              isFormLocked: disabled,
              onChange: (next: unknown) =>
                update(current.id, (e) => ({
                  ...e,
                  value: withValueAt(e.value, item.storagePath, next),
                })),
            },
          });
        };
        const errorCount = entryFields(layout).reduce(
          (sum, item) => sum + errorsFor(item).length,
          0,
        );
        return (
          <div
            key={current.id}
            className={`collapsible collapsible--entry${current.collapsed ? "" : " collapsible--open"}${current.collapsed && errorCount ? " collapsible--error" : ""}`}
          >
            <CollapsibleHeader
              headingId={headingId}
              title={
                <>
                  <span className="collapsible__number">{index + 1}</span>
                  <span className="collapsible__title">
                    {entryTitle(
                      entryFields(layout).map(summaryOf),
                      `${label} ${index + 1}`,
                    )}
                  </span>
                </>
              }
              collapsed={current.collapsed}
              errorCount={errorCount}
              onToggle={() =>
                update(current.id, (e) => ({ ...e, collapsed: !e.collapsed }))
              }
              actions={
                <button
                  type="button"
                  className="usa-button usa-button--unstyled collapsible__action collapsible__action--danger"
                  disabled={!canDelete}
                  onClick={() =>
                    setEntries((all) => all.filter((e) => e.id !== current.id))
                  }
                >
                  Delete
                </button>
              }
            />
            {current.collapsed && (
              <SummaryList items={entryFields(layout).map(summaryOf)} />
            )}
            <div className="collapsible__body" hidden={current.collapsed}>
              <EntryNodes
                nodes={layout}
                renderItem={renderItem}
                summaryOf={summaryOf}
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        className="usa-button usa-button--outline margin-top-2"
        disabled={!canAdd}
        onClick={() =>
          setEntries((all) => [...all, { ...entry({}), collapsed: false }])
        }
      >
        Add entry
      </button>
    </div>
  );
}

/** An entry's fields and groups, each group collapsible when its layout asks for it. */
function EntryNodes({
  nodes,
  renderItem,
  summaryOf,
}: {
  nodes: EntryNode<ListItem>[];
  renderItem: (item: ListItem) => React.ReactNode;
  summaryOf: (item: ListItem) => SummaryItem;
}) {
  return nodes.map((node, index) =>
    node.kind === "field" ? (
      renderItem(node.field)
    ) : (
      <EntryGroup
        key={index}
        node={node}
        renderItem={renderItem}
        summaryOf={summaryOf}
      />
    ),
  );
}

function EntryGroup({
  node,
  renderItem,
  summaryOf,
}: {
  node: Extract<EntryNode<ListItem>, { kind: "group" }>;
  renderItem: (item: ListItem) => React.ReactNode;
  summaryOf: (item: ListItem) => SummaryItem;
}) {
  const items = entryFields(node.children).map(summaryOf);
  const [collapsed, setCollapsed] = useState(
    () =>
      node.collapsible &&
      items.some((item) => item.value !== undefined && item.value !== ""),
  );
  const body = (
    <EntryNodes
      nodes={node.children}
      renderItem={renderItem}
      summaryOf={summaryOf}
    />
  );
  if (!node.collapsible)
    return (
      <fieldset className="usa-fieldset collapsible-list__group">
        <legend className="usa-legend font-sans-md">{node.label}</legend>
        {body}
      </fieldset>
    );
  return (
    <fieldset
      className={`usa-fieldset collapsible collapsible--fieldset${collapsed ? "" : " collapsible--open"}`}
    >
      <CollapsibleHeader
        title={<span className="collapsible__title">{node.label}</span>}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      {collapsed && <SummaryList items={items} />}
      <div className="collapsible__body" hidden={collapsed}>
        {body}
      </div>
    </fieldset>
  );
}

/** The JSON Forms control for a list tagged `CollapsibleFieldList`. */
export function CollapsibleListControl({
  uischema,
  visible,
  enabled,
}: ControlProps) {
  const context = useContext(AdapterContext);
  if (!visible || !context) return null;
  const [node] = controlToNodes(uischema, context.schema);
  if (node?.type !== "fieldList") return null;
  const { props } = getFieldConfig({
    uiFieldObject: node,
    formSchema: context.schema,
    errors: context.errors ?? null,
    formData: context.formData,
    requiredField: false,
  });
  return (
    <CollapsibleFieldList
      {...(props as unknown as ListProps)}
      detail={
        (uischema.options as { detail?: UISchemaElement } | undefined)?.detail
      }
      disabled={!enabled || !!context.isFormLocked}
    />
  );
}
