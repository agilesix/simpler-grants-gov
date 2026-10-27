import "simpler-forms";
import "#forms/index.tsp";
import "#questions/organization/index.tsp";
import "#questions/person/index.tsp";
import "#questions/types/address.tsp";

using SimplerForms;
namespace Forms.SF424Short;

// Reuse the shared address fields and validation. The source keeps Province inactive
// for USA rather than authorizing deletion of a retained draft answer.
model ShortAddress extends Questions.Types.Address {
  @UI.label("Province")
  @UI.disabledWhen(ShortAddress.country, Questions.Types.CountryCode.USA)
  province?: Questions.Types.AddressParts.Province;
}

// The role is supplied by the owning property. This source requires title and email,
// and its existing API calls the telephone phone_number rather than Person.phone.
// Compose the existing questions without adding aliases or a second runtime mapper.
model Contact {
  name: Questions.People.PersonName;
  title: Questions.People.PersonTitle;
  address: ShortAddress;
  phoneNumber: Questions.People.PersonPhoneNumber;
  fax?: Questions.People.PersonFaxNumber;
  email: Questions.People.PersonEmail;
}

enum ApplicantType {
  A: "A: State Government",
  B: "B: County Government",
  C: "C: City or Township Government",
  D: "D: Special District Government",
  E: "E: Regional Organization",
  F: "F: U.S. Territory or Possession",
  G: "G: Independent School District",
  H: "H: Public/state Controlled Institution of Higher Education",
  I: "I: Indian/Native American Tribal Government (Federally Recognized)",
  J: "J: Indian/Native American Tribal Government (Other than Federally Recognized)",
  K: "K: Indian/Native American Tribally Designated Organization",
  L: "L: Public/Indian Housing Authority",
  M: "M: Nonprofit with 501C3 IRS Status (Other than Institution of Higher Education)",
  N: "N: Nonprofit without 501C3 IRS Status (Other than Institution of Higher Education)",
  O: "O: Private Institution of Higher Education",
  P: "P: Individual",
  Q: "Q: For-Profit Organization (Other than Small Business)",
  R: "R: Small Business",
  S: "S: Hispanic-serving Institution",
  T: "T: Historically Black Colleges and Universities (HBCUs)",
  U: "U: Tribally Controlled Colleges and Universities (TCCUs)",
  V: "V: Alaska Native and Native Hawaiian Serving Institutions",
  W: "W: Non-domestic (non-US) Entity",
  X: "X: Other (specify)",
}

/** Application for Federal Domestic Assistance - Short Organizational. */
@Meta.form(#{
  id: "sf424-short",
  formName: "Application for Federal Domestic Assistance-Short Organizational",
})
@GrantsGov.form(#{
  legacyFormId: 711,
  shortFormName: "SF424_Short",
  formVersion: "3.0",
  agencyCode: "SGG",
  ombNumber: "4040-0003",
  expirationDate: "2028-07-31",
})
@example(
  #{
    agencyName: "Department of Community Programs",
    fundingOpportunityNumber: "DEMO-2027-001",
    fundingOpportunityTitle: "Community Research Demonstration",
    assistanceListingNumber: "99.999",
    assistanceListingProgramTitle: "Community Research Demonstration",
    organizationName: "Maple Community Research Centre",
    applicant: #{
      street1: "240 Maple Street",
      street2: "Suite 210",
      city: "Ottawa",
      province: "Ontario",
      country: Questions.Types.CountryCode.CAN,
      zipCode: "K1P 1J1",
    },
    applicantWebAddress: "https://maple.example.org",
    applicantTypeCode: #[ApplicantType.W, ApplicantType.X],
    employerTaxpayerIdentificationNumber: "44-4444444",
    samUei: "MCRC12345678",
    congressionalDistrictApplicant: "00-000",
    projectTitle: "Neighborhood Heat Resilience Study",
    projectDescription: "Survey neighborhood residents and map shaded gathering spaces to guide community heat-resilience planning. The project will share findings through public workshops and a plain-language report.",
    projectStartDate: plainDate.fromISO("2027-01-01"),
    projectEndDate: plainDate.fromISO("2027-12-31"),
    projectDirector: #{
      name: #{ firstName: "Avery", lastName: "Patel" },
      title: "Research Director",
      email: "avery.patel@example.org",
      phoneNumber: "613-555-0101",
      address: #{
        street1: "240 Maple Street",
        street2: "Suite 210",
        city: "Ottawa",
        province: "Ontario",
        country: Questions.Types.CountryCode.CAN,
        zipCode: "K1P 1J1",
      },
    },
    sameAsProjectDirector: false,
    contactPerson: #{
      name: #{ firstName: "Jordan", lastName: "Reyes" },
      title: "Grants Administrator",
      email: "jordan.reyes@example.org",
      phoneNumber: "613-555-0102",
      address: #{
        street1: "240 Maple Street",
        street2: "Suite 210",
        city: "Ottawa",
        province: "Ontario",
        country: Questions.Types.CountryCode.CAN,
        zipCode: "K1P 1J1",
      },
    },
    applicationCertification: true,
    authorizedRepresentative: #{ firstName: "Morgan", lastName: "Chen" },
    authorizedRepresentativeTitle: "Executive Director",
    authorizedRepresentativeEmail: "morgan.chen@example.org",
    authorizedRepresentativePhoneNumber: "613-555-0103",
    applicantTypeOtherSpecify: "Community research partnership",
  },
  #{
    title: "Canadian partner with Other applicant type",
    description: "Fictional Canadian addresses use Province without State. Selecting Other includes its explanation; the non-US EIN uses the DAT-prescribed 44-4444444 placeholder. Distinct director, administrator and signing role are retained; neither address validation nor a real registration, signature or submission is claimed.",
  }
)
@example(
  #{
    agencyName: "Department of Community Programs",
    fundingOpportunityNumber: "DEMO-2027-001",
    fundingOpportunityTitle: "Community Research Demonstration",
    assistanceListingNumber: "99.999",
    assistanceListingProgramTitle: "Community Research Demonstration",
    organizationName: "Prairie Community Research Center",
    applicant: #{
      street1: "128 Oak Avenue",
      city: "Springfield",
      county: "Sangamon",
      state: Questions.Types.StateCode.IL,
      country: Questions.Types.CountryCode.USA,
      zipCode: "62701-1234",
      street2: "Suite 200",
    },
    applicantWebAddress: "https://prairie.example.org",
    applicantTypeCode: #[ApplicantType.M],
    employerTaxpayerIdentificationNumber: "12-3456789",
    samUei: "PCRA12345678",
    congressionalDistrictApplicant: "IL-013",
    projectTitle: "Neighborhood Heat Resilience Study",
    projectDescription: "Survey neighborhood residents and map shaded gathering spaces to guide community heat-resilience planning. The project will share findings through public workshops and a plain-language report.",
    projectStartDate: plainDate.fromISO("2027-01-01"),
    projectEndDate: plainDate.fromISO("2027-12-31"),
    projectDirector: #{
      name: #{ firstName: "Avery", lastName: "Patel" },
      title: "Research Director",
      email: "avery.patel@example.org",
      phoneNumber: "217-555-0101",
      address: #{
        street1: "128 Oak Avenue",
        city: "Springfield",
        county: "Sangamon",
        state: Questions.Types.StateCode.IL,
        country: Questions.Types.CountryCode.USA,
        zipCode: "62701-1234",
      },
    },
    sameAsProjectDirector: false,
    contactPerson: #{
      name: #{ firstName: "Jordan", lastName: "Reyes" },
      title: "Grants Administrator",
      email: "jordan.reyes@example.org",
      phoneNumber: "217-555-0102",
      address: #{
        street1: "128 Oak Avenue",
        city: "Springfield",
        county: "Sangamon",
        state: Questions.Types.StateCode.IL,
        country: Questions.Types.CountryCode.USA,
        zipCode: "62701-1234",
      },
    },
    applicationCertification: true,
    authorizedRepresentative: #{ firstName: "Morgan", lastName: "Chen" },
    authorizedRepresentativeTitle: "Executive Director",
    authorizedRepresentativeEmail: "morgan.chen@example.org",
    authorizedRepresentativePhoneNumber: "217-555-0103",
  },
  #{
    title: "US nonprofit application draft",
    description: "Fictional organization, opportunity and three distinct people. US addresses use ZIP+4; source-populated opportunity/UEI values are illustrative context. Received date, signature and signed date are intentionally absent because this is a draft, not a submitted application.",
  }
)
model SF424Short {
  @doc("Name of the Federal agency. Supplied by the application/opportunity service; example context is illustrative.")
  @UI.label("Name of Federal Agency")
  @UI.readOnly
  @minLength(1)
  @maxLength(60)
  agencyName: string;

  @doc("Assistance Listing number supplied by the application/opportunity service, when available.")
  @UI.label("Assistance Listing Number")
  @UI.readOnly
  @minLength(1)
  @maxLength(15)
  assistanceListingNumber?: string;

  @doc("Assistance Listing program title supplied by the application/opportunity service, when available.")
  @UI.label("Assistance Listing Title")
  @UI.readOnly
  @minLength(1)
  @maxLength(120)
  assistanceListingProgramTitle?: string;

  @doc("Completed by Grants.gov upon submission. No authentic submission is performed in the preview.")
  @UI.label("Date Received")
  @UI.readOnly
  dateReceived?: plainDate;

  @doc("Funding opportunity number supplied by the application/opportunity service.")
  @UI.label("Funding Opportunity Number")
  @UI.readOnly
  @minLength(1)
  @maxLength(40)
  fundingOpportunityNumber: string;

  @doc("Funding opportunity title supplied by the application/opportunity service.")
  @UI.label("Funding Opportunity Title")
  @UI.readOnly
  @minLength(1)
  @maxLength(255)
  fundingOpportunityTitle: string;

  @UI.label("Legal Name")
  organizationName: Questions.Organizations.OrgName;

  @UI.label("Applicant address")
  applicant: ShortAddress;

  @doc("Enter the website address or uniform record locator (URL) of the applicant organization.")
  @UI.label("Web Address")
  @minLength(1)
  @maxLength(250)
  applicantWebAddress?: string;

  @doc("Select at least one and up to three applicant types, following agency instructions.")
  @UI.label("Type of Applicant")
  @UI.widget(Rendering.Widget.MultiSelect)
  @minItems(1)
  @maxItems(3)
  applicantTypeCode: ApplicantType[];

  @doc("Enter the applicant type here if you selected Other (specify).")
  @UI.label("Other Applicant Type")
  @Validation.requiredWhen(SF424Short.applicantTypeCode, ApplicantType.X)
  @minLength(0)
  @maxLength(30)
  applicantTypeOtherSpecify?: string;

  @doc("Enter either TIN or EIN as assigned by the Internal Revenue Service. If your organization is not in the US, enter 44-4444444. This field is required.")
  @UI.label("EIN/TIN")
  @minLength(9)
  @maxLength(30)
  employerTaxpayerIdentificationNumber: string;

  @doc("UEI supplied by the application/organization service. No SAM lookup is performed here.")
  @UI.label("UEI")
  @UI.readOnly
  samUei: Questions.Organizations.OrgUei;

  @doc("Enter the Congressional District in the format: 2 character State Abbreviation - 3 character District Number. Examples: CA-005 for California's 5th district, CA-012 for California's 12th district, NC-103 for North Carolina's 103rd district. This field is required. If outside the US, enter 00-000.")
  @UI.label("Congressional District of Applicant")
  @minLength(1)
  @maxLength(6)
  congressionalDistrictApplicant: string;

  @doc("Enter a brief, descriptive title of the project. This field is required.")
  @UI.label("Project Title")
  @minLength(1)
  @maxLength(200)
  projectTitle: string;

  @doc("Enter a brief description of the project. This field is required.")
  @UI.label("Project Description")
  @UI.widget(Rendering.Widget.TextArea)
  @minLength(1)
  @maxLength(1000)
  projectDescription: string;

  @doc("Enter the start date for the proposed project. This field is required.")
  @UI.label("Start Date")
  projectStartDate: plainDate;

  @doc("Enter the end date for the proposed project. This field is required.")
  @UI.label("End Date")
  projectEndDate: plainDate;

  @UI.label("Project Director")
  projectDirector: Contact;

  @doc("Check if this person is also the project director. Complete the Primary Contact section below; both contacts are required on this form.")
  @UI.label("Same as Project Director")
  @UI.widget(Rendering.Widget.Checkbox)
  sameAsProjectDirector?: boolean;

  @UI.label("Primary Contact / Grants Administrator")
  contactPerson: Contact;

  @doc("Read the certifications above and check to select.")
  @UI.label("I Agree")
  @UI.widget(Rendering.Widget.Checkbox)
  applicationCertification: boolean;

  @UI.label("Authorized Representative")
  authorizedRepresentative: Questions.People.PersonName;

  @UI.label("Title")
  authorizedRepresentativeTitle: Questions.People.PersonTitle;

  @UI.label("Email")
  authorizedRepresentativeEmail: Questions.People.PersonEmail;

  @UI.label("Phone Number")
  authorizedRepresentativePhoneNumber: Questions.People.PersonPhoneNumber;

  @UI.label("Fax Number")
  authorizedRepresentativeFax?: Questions.People.PersonFaxNumber;

  @doc("Completed by Grants.gov upon submission. Example text is synthetic context, not an actual signature.")
  @UI.label("Signature")
  @UI.readOnly
  @minLength(1)
  @maxLength(144)
  aorSignature?: string;

  @doc("Completed by Grants.gov upon submission. Example context does not establish a submitted application.")
  @UI.label("Date Signed")
  @UI.readOnly
  authorizedRepresentativeDateSigned?: plainDate;
}
