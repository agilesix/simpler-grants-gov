import type { Pinned, Recorded } from "../harness/model.ts";
import { YES_NO_BOOLEAN } from "./common.ts";

// Differences the attestation and certification forms share.

/** A signature or date Grants.gov fills in on submission, which the form doesn't ask. */
export const POST_POPULATED: Recorded = {
  category: "intentional",
  reason:
    "Grants.gov fills this in on submission, and so does the API's post-population rule (`signature` or `current_date`). The form shows it read-only and leaves it optional, since the applicant can't answer it. The rule fills it before the XML is written.",
};

/** `differingRules` entries recording `POST_POPULATED` for each path's requiredness. */
export const postPopulated = (paths: string[]): Record<string, Pinned> =>
  Object.fromEntries(
    paths.map((path) => [
      `${path}/required`,
      { plan: "no", source: "yes", ...POST_POPULATED },
    ]),
  );

/** An answer Grants.gov copies from another form in the package, which the applicant enters here. */
export const FORWARD_POPULATED: Recorded = {
  category: "intentional",
  reason:
    "Grants.gov copies this answer from the SF-424. The API has no rule that does that, so the applicant enters it, as on SGG's Lobbying form, with the question bank's help.",
};

/** The help of a signature or date, which explains how to fill it in on a paper copy. */
export const PAPER_COPY_HELP: Recorded = {
  category: "intentional",
  reason:
    "The DAT's help explains what to do on a paper copy. Simpler Grants only takes electronic applications, so the form uses the question bank's help.",
};

/** `differingRules` entries recording `YES_NO_BOOLEAN` for each yes/no answer's JSON path. */
export const yesNo = (paths: string[]): Record<string, Pinned> =>
  Object.fromEntries(
    paths.map((path) => [
      `${path}/enum`,
      { plan: null, source: ["Y: Yes", "N: No"], ...YES_NO_BOOLEAN },
    ]),
  );
