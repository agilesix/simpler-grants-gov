import type { FormDiff } from "../harness/model.ts";
import { BANK_WORDING } from "./common.ts";

const email = {
  category: "intentional",
  reason:
    "The email format already rejects empty values in the form schema. The XSD states a separate minimum length of one.",
} as const;
const bool = {
  category: "intentional",
  reason:
    "The form stores a Boolean. The authored XML transform writes the source Yes/No enumeration.",
} as const;
const zipState = {
  category: "upstream",
  reason:
    "The DAT marks the field required and its instructions limit that requirement to US addresses. The shared address makes it conditional.",
} as const;
const contactOrder = {
  category: "intentional",
  reason:
    "The shared Person question groups the name and address before phone, fax and email. The authored XML mapping keeps the source sequence.",
} as const;
const shortContact = {
  category: "gap",
  reason:
    "Existing SGG requires contact details in both roles. The XSD permits omission, and the DAT says to skip the second role when the director is the contact. Copy and omission remain source decisions.",
} as const;
const shortRole = {
  category: "upstream",
  reason:
    "The DAT and maintained SGG require the project director’s title, phone and email. The shared XSD type permits omission.",
} as const;
const shortDateDat = {
  category: "gap",
  reason:
    "DAT row 3-1 describes the received date as a label. The original XSD requires the element and the maintained API owns population and its empty wire value.",
} as const;
const district = {
  category: "intentional",
  reason:
    "The XSD allows one to six characters with no pattern. The shared question requires DAT 5g-1's format: two state characters, a hyphen and a three-character district (CA-005, 00-000).",
} as const;
const url = {
  category: "gap",
  reason:
    "The maintained SGG form allows a 250-character string. The DAT specifies 50 characters and the XSD uses anyURI. Reconcile that limit and admission before integration.",
} as const;

export const DIFF: FormDiff = {
  slug: "application-for-federal-domestic-assistance-short-organizational",
  xml: "xml-mapping",
  wording: BANK_WORDING,
  dat: {
    absentFromSource: {
      "3-1": shortDateDat,
    },
    outOfOrder: {
      "7-10": contactOrder,
      "7-11": contactOrder,
      "7-09": contactOrder,
      "8-11": contactOrder,
      "8-12": contactOrder,
      "8-10": contactOrder,
    },
    differingRules: {
      "5b-6/required": { ...zipState, plan: "conditional", source: "yes" },
      "5b-9/required": { ...zipState, plan: "conditional", source: "yes" },
      "5c-2/maxLength": { ...url, plan: 250, source: 50 },
      "7-16/required": { ...zipState, plan: "conditional", source: "yes" },
      "7-19/required": { ...zipState, plan: "conditional", source: "yes" },
      "8-17/required": { ...zipState, plan: "conditional", source: "yes" },
      "8-20/required": { ...zipState, plan: "conditional", source: "yes" },
    },
  },
  xsd: {
    differingRules: {
      "ApplicantWebAddress/minLength": { ...url, plan: 1, source: null },
      "CongressionalDistrictApplicant/minLength": {
        ...district,
        plan: 6,
        source: 1,
      },
      "CongressionalDistrictApplicant/pattern": {
        ...district,
        plan: "^[A-Z0-9]{2}-[A-Za-z0-9]{3}$",
        source: null,
      },
      "ApplicantWebAddress/maxLength": { ...url, plan: 250, source: null },
      "ProjectDirectorGroup/Title/required": {
        ...shortRole,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Phone/required": {
        ...shortRole,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Email/required": {
        ...shortRole,
        plan: "yes",
        source: "no",
      },
      "ProjectDirectorGroup/Email/minLength": {
        ...email,
        plan: null,
        source: 1,
      },
      "SameAsProjectDirector/enumType": {
        ...bool,
        plan: null,
        source: "YesNoDataType",
      },
      "ContactPersonGroup/Name/FirstName/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Name/LastName/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Title/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/Street1/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/City/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Address/Country/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Phone/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Email/required": {
        ...shortContact,
        plan: "yes",
        source: "no",
      },
      "ContactPersonGroup/Email/minLength": { ...email, plan: null, source: 1 },
      "ApplicationCertification/enumType": {
        ...bool,
        plan: null,
        source: "YesNoDataType",
      },
      "AuthorizedRepresentativeEmail/minLength": {
        ...email,
        plan: null,
        source: 1,
      },
    },
  },
};
