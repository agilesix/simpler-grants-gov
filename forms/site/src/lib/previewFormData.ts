import type { RJSFSchema } from "@rjsf/utils";
import { condenseFormSchemaProperties } from "@sgg/frontend/utils/applyForm/applyFormUtils";
import {
  getByPointer,
  getFieldPathFromHtml,
} from "@sgg/frontend/utils/formData/formDataUtils";

/** Include rendered, schema-readonly values in the preview's native submission snapshot.
 * The API normally repopulates those answers. A standalone preview has no API context.
 * Other disabled controls stay excluded, and removed controls have nothing to restore.
 */
export function previewFormData(
  form: HTMLFormElement,
  schema: RJSFSchema,
): FormData {
  const data = new FormData(form);
  const fields = condenseFormSchemaProperties(schema);
  for (const field of form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input:disabled[name],select:disabled[name],textarea:disabled[name]")) {
    const pointer = getFieldPathFromHtml(
      field.name.replace(/\[\d+\]/g, "--items"),
    );
    const definition = getByPointer(fields, pointer) as RJSFSchema | undefined;
    if (!definition?.readOnly || data.has(field.name)) continue;
    if (
      field instanceof HTMLInputElement &&
      field.type === "radio" &&
      !field.checked
    )
      continue;
    const value =
      field instanceof HTMLInputElement && field.type === "checkbox"
        ? String(field.checked)
        : field.value;
    data.append(field.name, value);
  }
  return data;
}
