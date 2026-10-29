import path from "node:path";
import { expect, test } from "@playwright/test";
import playwrightEnv from "tests/e2e/playwright-env";
import { VALID_TAGS } from "tests/e2e/tags";
import { createApplication } from "tests/e2e/utils/application/create-application-utils";
import { authenticateE2eUser } from "tests/e2e/utils/auth/authenticate-e2e-user-utils";
import { skipNonChromeOnStaging } from "tests/e2e/utils/auth/skip-non-chrome-staging-utils";
import { verifyVirusScanPassedAndUploaded } from "tests/e2e/utils/forms/file-upload-status-utils";
import { openForm } from "tests/e2e/utils/forms/form-navigation-utils";
import { saveForm } from "tests/e2e/utils/forms/save-form-utils";
import { buildPrintUrl } from "tests/e2e/utils/submission/print-view-utils";
import {
  submitApplicationAndVerify,
  verifySubmissionConfirmation,
} from "tests/e2e/utils/submission/submit-application-utils";

for (const orgLabel of [undefined, playwrightEnv.testOrgLabel]) {
  test(
    `PHS Research Plan upload, remove, print and submit (${orgLabel ? "organization" : "individual"})`,
    { tag: [VALID_TAGS.APPLY_FORMS, VALID_TAGS.FULL_REGRESSION] },
    async ({ page, context }, testInfo) => {
      skipNonChromeOnStaging(testInfo);
      test.setTimeout(300_000);
      await authenticateE2eUser(
        page,
        context,
        /mobile/i.test(testInfo.project.name),
      );
      await createApplication(
        page,
        "/opportunity/42e83601-97ac-5980-9fb1-577d2e1735f5",
        orgLabel,
      );
      const applicationUrl = page.url();
      await openForm(page, "PHS 398 Research Plan");
      const formUrl = page.url();
      const save = async (errors = false) => {
        await Promise.all([
          page.waitForResponse(
            (r) =>
              r.request().method() === "POST" &&
              new URL(r.url()).pathname === new URL(formUrl).pathname,
          ),
          saveForm(page, errors),
        ]);
      };
      await save(true);
      await expect(
        page.getByText(/Research Strategy is required/).first(),
      ).toBeVisible();
      const source = path.resolve(
        "tests/e2e/test-upload-files/sample-upload-kb.pdf",
      );
      for (const field of ["research_strategy", "specific_aims"]) {
        await page
          .locator(`input[name="${field}-visible"][type=file]`)
          .setInputFiles(source);
        await verifyVirusScanPassedAndUploaded(
          page,
          "sample-upload-kb.pdf",
          page.locator(`input[name="${field}"]`).locator(".."),
          false,
        );
        await expect(page.locator(`input[name="${field}"]`)).toHaveValue(
          /[0-9a-f]{8}-/,
        );
      }
      await save();
      await page.reload();
      const aims = page.locator('input[name="specific_aims"]');
      await expect(page.locator('input[name="research_strategy"]')).toHaveValue(
        /[0-9a-f]{8}-/,
      );
      // Delete from the Specific Aims field only; the Strategy remains required and retained.
      const aimsSection = aims.locator("..");
      const deleteButton = aimsSection.getByRole("button", {
        name: "Delete",
        exact: true,
      });
      await deleteButton.click();
      await page
        .getByRole("button", { name: "Delete file", exact: true })
        .click();
      await save();
      await page.reload();
      await expect(aims).toHaveValue("");
      await page.goto(buildPrintUrl(formUrl));
      await expect(
        page.getByText("sample-upload-kb.pdf", { exact: true }),
      ).toHaveCount(1);
      await page.goto(applicationUrl);
      await submitApplicationAndVerify(page, "success");
      await verifySubmissionConfirmation(page);
    },
  );
}
