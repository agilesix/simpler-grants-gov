import type { FormDiff } from "../harness/model.ts";

// Source-qualified proposal; re-run against the final reader/root-selector implementation.
export const DIFF: FormDiff = {
  slug: "assurances-for-non-construction-programs-sf-424b-r-r",
  xml: "xml-mapping",
  dat: {
    differingLabels: {
      "19-0": {
        plan: "* SIGNATURE OF AUTHORIZED CERTIFYING OFFICIAL",
        source: "SIGNATURE OF AUTHORIZED CERTIFYING OFFICIAL",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "19-1": {
        plan: "* TITLE",
        source: "TITLE",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "19-2": {
        plan: "* APPLICANT ORGANIZATION",
        source: "APPLICANT ORGANIZATION",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
      "19-3": {
        plan: "* DATE SUBMITTED",
        source: "DATE SUBMITTED",
        category: "intentional",
        reason:
          "The library marks this required value with an asterisk. The DAT requires it in the Required column but does not print an asterisk in this label.",
      },
    },
  },
  xsd: {
    absentFromPlan: {
      FormVersionIdentifier: {
        category: "intentional",
        reason:
          "FormVersionIdentifier is required XML edition metadata, not an applicant answer or a DAT field. The target declares edition 1.1 as a default, but the current emitter omits it; both actual XML examples fail original-XSD validation. The separate mapping gap retains that output hold.",
      },
    },
    differingRules: {
      "AuthorizedRepresentative/RepresentativeName/required": {
        plan: "yes",
        source: "no",
        category: "upstream",
        reason:
          "The DAT requires this completed-form value at 19-0. The XSD makes it optional. The definition preserves the DAT requirement; actual cover/submission population remains separate from the synthetic example.",
      },
      "AuthorizedRepresentative/RepresentativeTitle/required": {
        plan: "yes",
        source: "no",
        category: "upstream",
        reason:
          "The DAT requires this completed-form value at 19-1. The XSD makes it optional. The definition preserves the DAT requirement; actual cover/submission population remains separate from the synthetic example.",
      },
      "ApplicantOrganizationName/required": {
        plan: "yes",
        source: "no",
        category: "upstream",
        reason:
          "The DAT requires this completed-form value at 19-2. The XSD makes it optional. The definition preserves the DAT requirement; actual cover/submission population remains separate from the synthetic example.",
      },
      "SubmittedDate/required": {
        plan: "yes",
        source: "no",
        category: "upstream",
        reason:
          "The DAT requires this completed-form value at 19-3. The XSD makes it optional. The definition preserves the DAT requirement; actual cover/submission population remains separate from the synthetic example.",
      },
    },
  },
  xmlMappingVsXsd: {
    absentFromPlan: {
      FormVersionIdentifier: {
        category: "gap",
        reason:
          "The source XSD requires FormVersionIdentifier. The XML target declares the edition default, but the current emitter does not write default-valued scalar elements. Both generated samples therefore fail original-XSD validation. This draft needs shared constant/default-element support reviewed before integration; metadata is not an applicant answer.",
      },
    },
  },
};
