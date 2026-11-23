import type { FormDiff, Pinned, Recorded } from "../harness/model.ts";
import { postPopulated, yesNo } from "./attestation.ts";
import { SHARED_HELP, unstarredRequired } from "./common.ts";

/** The three numbered place-of-performance lines, which the form asks as one list. */
const NUMBERED: Recorded = {
  category: "intentional",
  reason:
    "The DAT and XSD number three place-of-performance lines (PlaceofPerformance1 to 3). The form asks for a list of up to three, and the XML mapping writes each item to its numbered element with Mapping.Item. The plan lists the list once, at the first element.",
};

const numberedOccurrences: Pinned = { ...NUMBERED, plan: 3, source: 1 };

/** A checkbox the DAT labels "Check", with its text in a label row after it. */
const CHECKBOX_LABEL: Recorded = {
  category: "upstream",
  reason:
    "The DAT labels the checkbox “Check” and puts the rest of its sentence in a separate label row. The form labels the checkbox with the whole sentence, as its help text says it.",
};

export const DIFF: FormDiff = {
  slug: "fra-f-30",
  xml: "xml-mapping",
  dat: {
    absentFromPlan: { "02-B-1-2": NUMBERED, "02-B-1-3": NUMBERED },
    differingLabels: {
      "02-B-1-1": {
        ...NUMBERED,
        plan: "Place of Performance (Street address, city, county, state, zip code)",
        source: null,
      },
      "02-B-2": {
        ...CHECKBOX_LABEL,
        plan: "Check if there are workplaces on file that are not identified here.",
        source: "Check",
      },
      "03-0-1": {
        ...CHECKBOX_LABEL,
        plan: "Check if applicable certification is for the award of a grant or cooperative agreement exceeding $100,000 or a federal loan exceeding $150,000",
        source: "CHECK",
      },
      "03-2-5-2": unstarredRequired(
        "Typed Name and Title",
        "TYPED NAME AND TITLE",
      ),
    },
    differingRules: {
      ...postPopulated(["03-2-5-1", "03-2-5-3"]),
      "02-B-1-1/maxOccurs": numberedOccurrences,
    },
    differingHelp: {
      "02-B-1-1": {
        ...NUMBERED,
        plan: "Enter up to three places of performance, one per line.",
        source: "Enter line one of three.",
      },
      "03-2-5-1": {
        ...SHARED_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source: "Completed on submission to Grants.gov.",
      },
      "03-2-5-3": {
        ...SHARED_HELP,
        plan: "Completed by Grants.gov upon submission.",
        source: "Completed on submission to Grants.gov.",
      },
    },
  },
  xsd: {
    absentFromPlan: {
      PlaceofPerformance2: NUMBERED,
      PlaceofPerformance3: NUMBERED,
    },
    differingRules: {
      ...postPopulated(["AuthorizedRepresentative/Signature", "DateSigned"]),
      "PlaceofPerformance1/maxOccurs": numberedOccurrences,
      "PlaceofPerformance1/minLength": {
        plan: 1,
        source: 0,
        category: "intentional",
        reason:
          "FRA_POPDataType allows an empty line. An entry in the form's list is a line the applicant adds, so it needs at least one character; an unused line is left out of the list.",
      },
    },
  },
  xmlMapping: {
    absentFromPlan: {
      "places_of_performance[] -> PlaceofPerformance2": NUMBERED,
      "places_of_performance[] -> PlaceofPerformance3": NUMBERED,
    },
  },
  jsonSchemaVsXsd: {
    differingRules: {
      ...yesNo(["workplaces_not_identified", "exceeds_lobbying_threshold"]),
      ...postPopulated(["signature", "date_signed"]),
      "places_of_performance[]/maxOccurs": numberedOccurrences,
    },
  },
};
