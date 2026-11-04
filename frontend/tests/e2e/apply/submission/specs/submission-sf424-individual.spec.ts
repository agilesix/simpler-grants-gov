import { test } from "@playwright/test";
import { exerciseIndividual } from "tests/e2e/apply/submission/flows/sf424-individual";
import { VALID_TAGS } from "tests/e2e/tags";
import { createApplication } from "tests/e2e/utils/application/create-application-utils";
import { authenticateE2eUser } from "tests/e2e/utils/auth/authenticate-e2e-user-utils";
import { skipNonChromeOnStaging } from "tests/e2e/utils/auth/skip-non-chrome-staging-utils";
import { openForm } from "tests/e2e/utils/forms/form-navigation-utils";

test(
  "SF-424 Individual entry, conditional answers, validation and print",
  {
    tag: [VALID_TAGS.APPLY_FORMS, VALID_TAGS.FULL_REGRESSION],
  },
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
      "/opportunity/79d20cef-63a6-4d6f-84a1-78c81f2c0603",
    );
    await openForm(
      page,
      "Application for Federal Domestic Assistance - Individual",
    );
    await exerciseIndividual(page);
  },
);
