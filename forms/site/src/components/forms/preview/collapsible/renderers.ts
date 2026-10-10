import {
  COLLAPSIBLE_FIELD_LIST,
  COLLAPSIBLE_FIELDSET,
  widgetOf,
} from "@/lib/collapsible";
import {
  and,
  isControl,
  rankWith,
  uiTypeIs,
  type JsonFormsRendererRegistryEntry,
  type Tester,
} from "@jsonforms/core";
import {
  withJsonFormsControlProps,
  withJsonFormsLayoutProps,
} from "@jsonforms/react";

import { CollapsibleListControl } from "./CollapsibleFieldList";
import CollapsibleFieldset from "./CollapsibleFieldset";

/** Above the SGG adapter's 10, so these draw the elements tagged with their widget. */
const RANK = 20;

const widgetIs =
  (name: string): Tester =>
  (uischema) =>
    widgetOf(uischema) === name;

/**
 * The form library's own widgets. A form opts in with `@UI.widget(Rendering.Widget.…)` on a
 * property; without that decorator the SGG adapter draws the element as it always has.
 */
export const collapsibleRenderers: JsonFormsRendererRegistryEntry[] = [
  {
    tester: rankWith(
      RANK,
      and(uiTypeIs("Group"), widgetIs(COLLAPSIBLE_FIELDSET)),
    ),
    renderer: withJsonFormsLayoutProps(CollapsibleFieldset),
  },
  {
    tester: rankWith(RANK, and(isControl, widgetIs(COLLAPSIBLE_FIELD_LIST))),
    renderer: withJsonFormsControlProps(CollapsibleListControl),
  },
];
