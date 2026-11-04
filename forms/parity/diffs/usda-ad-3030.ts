import type { FormDiff } from "../harness/model.ts";

// Declared DAT/XSD departures; output and lifecycle acceptance remain separate.
export const DIFF: FormDiff = {
  slug: "usda-ad-3030",
  xml: "xml-mapping",
  dat: {
    differingLabels: {
      "1-05": {
        plan: "* 1. APPLICANT'S NAME",
        source: "1. APPLICANT'S NAME",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-06": {
        plan: "* 2. APPLICANT'S ADDRESS (Including Zip Code)",
        source: "2. APPLICANT'S ADDRESS (Including Zip Code)",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-07": {
        plan: "* 3. TAX ID NO. (Last 4 digits)",
        source: "3. TAX ID NO. (Last 4 digits)",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-08": {
        plan: "* 4A. Has the Applicant been convicted of a felony criminal violation under any Federal law in the 24 months preceding the date of application?",
        source:
          "4A. Has the Applicant been convicted of a felony criminal violation under any Federal law in the 24 months preceding the date of application?",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-09": {
        plan: "* 4B. Does the Applicant have any unpaid Federal tax liability that has been assessed, for which all judicial and administrative remedies have been exhausted or have lapsed, and that is not being paid in a timely manner pursuant to an agreement with the authority responsible for collecting the tax liability?",
        source:
          "4B. Does the Applicant have any unpaid Federal tax liability that has been assessed, for which all judicial and administrative remedies have been exhausted or have lapsed, and that is not being paid in a timely manner pursuant to an agreement with the authority responsible for collecting the tax liability?",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-12": {
        plan: "* 5A. APPLICANT'S SIGNATURE (BY)",
        source: "5A. APPLICANT'S SIGNATURE (BY)",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-13": {
        plan: "* 5B. TITLE/RELATIONSHIP OF THE INDIVIDUAL IF SIGNING IN A REPRESENTATIVE CAPACITY",
        source:
          "5B. TITLE/RELATIONSHIP OF THE INDIVIDUAL IF SIGNING IN A REPRESENTATIVE CAPACITY",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "1-14": {
        plan: "* 5C. DATE SIGNED (MM-DD-YYYY)",
        source: "5C. DATE SIGNED (MM-DD-YYYY)",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
    },
    absentFromPlan: {
      "1-08-A": {
        category: "intentional",
        reason:
          "This DAT row is the Yes option of the required parent question 1-08, not another answer. The parent enum preserves this source option and its encoded Y: Yes / N: No XML value.",
      },
      "1-08-B": {
        category: "intentional",
        reason:
          "This DAT row is the No option of the required parent question 1-08, not another answer. The parent enum preserves this source option and its encoded Y: Yes / N: No XML value.",
      },
      "1-09-A": {
        category: "intentional",
        reason:
          "This DAT row is the Yes option of the required parent question 1-09, not another answer. The parent enum preserves this source option and its encoded Y: Yes / N: No XML value.",
      },
      "1-09-B": {
        category: "intentional",
        reason:
          "This DAT row is the No option of the required parent question 1-09, not another answer. The parent enum preserves this source option and its encoded Y: Yes / N: No XML value.",
      },
    },
  },
  xsd: {
    differingRules: {
      "TaxIDNumber/pattern": {
        plan: "^[0-9]{4}$",
        source: null,
        category: "upstream",
        reason:
          "DAT1-07 says the tax identifier suffix must be four digits. The XSD checks four-character length only. The definition keeps the DAT digits rule and preserves leading zeros as text.",
      },
    },
  },
};
