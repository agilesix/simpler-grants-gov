import type { FormDiff } from "../harness/model.ts";
import { FORWARD_POPULATED, postPopulated, yesNo } from "./attestation.ts";
import { RADIO_OPTIONS, SHARED_HELP, unstarredRequired } from "./common.ts";

export const DIFF: FormDiff = {
  slug: "usda-ad-3030",
  dat: {
    absentFromPlan: {
      "1-08-A": RADIO_OPTIONS,
      "1-08-B": RADIO_OPTIONS,
      "1-09-A": RADIO_OPTIONS,
      "1-09-B": RADIO_OPTIONS,
    },
    differingLabels: {
      "1-05": unstarredRequired("1. Applicant's Name", "1. APPLICANT'S NAME"),
      "1-06": unstarredRequired(
        "2. Applicant's Address (Including Zip Code)",
        "2. APPLICANT'S ADDRESS (Including Zip Code)",
      ),
      "1-07": unstarredRequired(
        "3. Tax ID No. (Last 4 Digits)",
        "3. TAX ID NO. (Last 4 digits)",
      ),
      "1-08": unstarredRequired(
        "4A. Has the Applicant been convicted of a felony criminal violation under any Federal law in the 24 months preceding the date of application?",
        "4A. Has the Applicant been convicted of a felony criminal violation under any Federal law in the 24 months preceding the date of application?",
      ),
      "1-09": unstarredRequired(
        "4B. Does the Applicant have any unpaid Federal tax liability that has been assessed, for which all judicial and administrative remedies have been exhausted or have lapsed, and that is not being paid in a timely manner pursuant to an agreement with the authority responsible for collecting the tax liability?",
        "4B. Does the Applicant have any unpaid Federal tax liability that has been assessed, for which all judicial and administrative remedies have been exhausted or have lapsed, and that is not being paid in a timely manner pursuant to an agreement with the authority responsible for collecting the tax liability?",
      ),
      "1-13": unstarredRequired(
        "5B. Title/Relationship of the Individual if Signing in a Representative Capacity",
        "5B. TITLE/RELATIONSHIP OF THE INDIVIDUAL IF SIGNING IN A REPRESENTATIVE CAPACITY",
      ),
    },
    differingRules: postPopulated(["1-12", "1-14"]),
    differingHelp: {
      "1-12": {
        ...SHARED_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "Completed by Grants.gov upon submission. This is a required field.",
      },
      "1-13": {
        ...FORWARD_POPULATED,
        plan: "Enter the position title.",
        source:
          "Pre-populated from the Application cover sheet. This is a required field.",
      },
      "1-14": {
        ...SHARED_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source:
          "Completed by Grants.gov upon submission. This is a required field.",
      },
    },
  },
  xsd: {
    differingRules: {
      ...postPopulated(["AORSignature", "DateSigned"]),
      "TaxIDNumber/pattern": {
        plan: "^[0-9]{4}$",
        source: null,
        category: "upstream",
        reason:
          "The DAT says the Tax ID must be 4 digits. The XSD only limits its length to 4, so the form adds the DAT's rule.",
      },
    },
  },
  jsonSchemaVsXsd: {
    differingRules: {
      ...yesNo(["applicant_felony", "unpaid_federal_tax"]),
      ...postPopulated(["signature", "date_signed"]),
    },
  },
};
