import { expect, type Page } from "@playwright/test";
import { saveForm } from "tests/e2e/utils/forms/save-form-utils";
import {
  assertPrintViewIsReadOnly,
  buildPrintUrl,
} from "tests/e2e/utils/submission/print-view-utils";

/** Exercise the new form through native entry, persistence, validation and print. */
export async function exerciseIndividual(page: Page) {
  const save = async (expectErrors = false) => {
    const pending = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" && response.url() === page.url(),
    );
    await saveForm(page, expectErrors);
    expect((await pending).status()).toBe(200);
    await expect(page.getByTestId("apply-form-save")).toHaveText(
      "Save and refresh",
    );
  };
  const field = (name: string) => page.locator(`[name="${name}"]`);
  const citizenship = (yes: boolean) =>
    page.locator(
      `label[for="applicant--citizenship--is_us_citizen-${yes ? 0 : 1}"]`,
    );
  await field("applicant--address--country").selectOption("USA: UNITED STATES");
  for (const [name, value] of Object.entries({
    "applicant--name--first_name": "Alicia",
    "applicant--name--last_name": "Reyes",
    "applicant--phone": "4105550100",
    "applicant--email": "alicia.reyes@example.org",
    "applicant--address--street1": "100 Grant Avenue",
    "applicant--address--city": "Baltimore",
    "applicant--address--zip_code": "21218-1234",
    "applicant--congressional_district": "MD-007",
    "project--title": "true",
    "project--description": "null",
    "project--start_date": "2027-01-01",
    "project--end_date": "2027-12-31",
  }))
    await field(name).fill(value);
  await field("applicant--address--state").selectOption("MD: Maryland");
  await citizenship(true).click();
  await page.locator('label[for="certification--agree"]').click();
  await save();
  await page.reload();
  await expect(field("project--title")).toHaveValue("true");
  await expect(field("project--description")).toHaveValue("null");
  await expect(field("opportunity--agency_name")).toBeDisabled();
  await expect(field("opportunity--agency_name")).not.toHaveValue("");
  await expect(field("date_received")).toHaveValue("");
  await expect(field("certification--signature")).toHaveValue("");
  await citizenship(false).click();
  await expect(
    field("applicant--citizenship--country_of_citizenship"),
  ).toBeEnabled();
  await save(true);
  await page.reload();
  await expect(
    page.locator("#applicant--citizenship--is_us_citizen-1"),
  ).toBeChecked();
  await field("applicant--citizenship--country_of_citizenship").selectOption(
    "URY: URUGUAY",
  );
  await field("applicant--citizenship--residency_start_date").fill(
    "2025-01-15",
  );
  await save();
  await field("project--end_date").fill("2026-12-31");
  await save(true);
  await expect(
    page
      .getByText("End date must be the same as or later than start date", {
        exact: false,
      })
      .first(),
  ).toBeVisible();
  await field("project--end_date").fill("2027-12-31");
  await page.locator('label[for="certification--agree"]').click();
  await save(true);
  await page.locator('label[for="certification--agree"]').click();
  await save();
  await citizenship(true).click();
  await save();
  await page.reload();
  await expect(
    field("applicant--citizenship--country_of_citizenship"),
  ).toBeDisabled();
  await expect(
    field("applicant--citizenship--country_of_citizenship"),
  ).toHaveValue("");
  await page.goto(buildPrintUrl(page.url()));
  await assertPrintViewIsReadOnly(page);
  await expect(page.getByText("true", { exact: true })).toBeVisible();
  await expect(page.getByText("null", { exact: true })).toBeVisible();
}
