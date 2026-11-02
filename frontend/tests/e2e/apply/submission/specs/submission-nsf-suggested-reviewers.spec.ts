import { expect, test } from "@playwright/test";
import playwrightEnv from "tests/e2e/playwright-env";
import { VALID_TAGS } from "tests/e2e/tags";
import { createApplication } from "tests/e2e/utils/application/create-application-utils";
import { authenticateE2eUser } from "tests/e2e/utils/auth/authenticate-e2e-user-utils";
import { skipNonChromeOnStaging } from "tests/e2e/utils/auth/skip-non-chrome-staging-utils";
import { openForm } from "tests/e2e/utils/forms/form-navigation-utils";
import { saveForm } from "tests/e2e/utils/forms/save-form-utils";
import { buildPrintUrl } from "tests/e2e/utils/submission/print-view-utils";
import {
  submitApplicationAndVerify,
  verifySubmissionConfirmation,
} from "tests/e2e/utils/submission/submit-application-utils";

for (const orgLabel of [undefined, playwrightEnv.testOrgLabel]) {
  test(
    `NSF Suggested Reviewers independent answers, clear, print and submit (${orgLabel ? "organization" : "individual"})`,
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
        "/opportunity/0d2b4cc6-9314-54f7-b87e-c2de5b1b9d2c",
        orgLabel,
      );
      const applicationUrl = page.url();
      await openForm(page, "NSF Suggested Reviewers");
      const suggested = page.getByRole("textbox", {
        name: "Suggested reviewers",
        exact: true,
      });
      const excluded = page.getByRole("textbox", {
        name: "Reviewers not to include",
        exact: true,
      });
      const suggestedValue =
        "Dr. Ada Example & <scope>.\nExpertise: microbial ecology.";
      const excludedValue = "Dr. Ben Example; recent collaborator.";
      await saveForm(page);
      await page.reload();
      await expect(suggested).toHaveValue("");
      await expect(excluded).toHaveValue("");
      await suggested.fill(suggestedValue);
      await saveForm(page);
      await page.reload();
      await expect(suggested).toHaveValue(suggestedValue);
      await expect(excluded).toHaveValue("");
      await excluded.fill(excludedValue);
      await suggested.fill("");
      await saveForm(page);
      await page.reload();
      await expect(suggested).toHaveValue("");
      await expect(excluded).toHaveValue(excludedValue);
      await suggested.fill(suggestedValue);
      await saveForm(page);
      await page.goto(buildPrintUrl(page.url()));
      await expect(
        page.getByText(suggestedValue, { exact: false }),
      ).toBeVisible();
      await expect(
        page.getByText(excludedValue, { exact: false }),
      ).toBeVisible();
      await page.goto(applicationUrl);
      await submitApplicationAndVerify(page, "success");
      await verifySubmissionConfirmation(page);
    },
  );
}
