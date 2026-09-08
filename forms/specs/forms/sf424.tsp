import "simpler-forms";
import "simpler-forms-sgg";
import "./index.tsp";
import "../question-bank/aor/index.tsp";
import "../question-bank/application/index.tsp";
import "../question-bank/generics/index.tsp";
import "../question-bank/opportunity/index.tsp";
import "../question-bank/poc/index.tsp";
import "../question-bank/primary-org/index.tsp";
import "../question-bank/project/index.tsp";

using SimplerForms;
// SggPrePop lives in the emitter package, not the portable library.
using SimplerForms.Sgg;
using QuestionBank.Aor;
using QuestionBank.Application;
using QuestionBank.Generics;
using QuestionBank.Opportunity;
using QuestionBank.Poc;
using QuestionBank.PrimaryOrg;
using QuestionBank.Project;

namespace Forms.SF424;

/** The numbered boxes of the paper form, in order. */
enum Sf424Section {
  submissionType: "1. Type of Submission",
  applicationTypeAndRevision: "2. Type of Application",
  dateReceived: "3. Date Received",
  applicantIdentifier: "4. Applicant Identifier",
  federalIdentifiers: "5a. Federal Identifiers",
  federalAward: "5b. Federal Award",
  dateReceivedByState: "6. Date Received by State",
  stateApplicationIdentifier: "7. State Application Identifier",
  applicantInformation: "8. Applicant Information",
  organizationalUnit: "8e. Organizational Unit",
  contactPerson: "8f. Name and contact information of person to be contacted on matters involving this application",
  typeOfApplicant: "9. Type of Applicant",
  federalAgency: "10. Name of Federal Agency",
  assistanceListing: "11. Assistance Listing Number/Title",
  fundingOpportunity: "12. Funding Opportunity Number/Title",
  competitionIdentification: "13. Competition Identification Number/Title",
  areasAffected: "14. Areas Affected by Project",
  projectTitle: "15. Descriptive Title of Applicant's Project",
  congressionalDistricts: "16. Congressional Districts",
  projectDates: "17. Proposed Project Start and End Dates",
  estimatedFunding: "18. Estimated Funding",
  stateReview: "19. Is Application Subject to Review by State Under Executive Order?",
  federalDebt: "20. Is the Applicant Delinquent on any Federal Debt?",
  authorizedRepresentative: "21. Authorized Representative",
}

/** APPLICATION FOR FEDERAL ASSISTANCE (SF-424) */
@Meta.form(#{
  id: "sf424",
  legacyFormId: 713,
  formName: "Application for Federal Assistance (SF-424)",
  shortFormName: "SF424_4_0",
  formVersion: "4.0",
  agencyCode: "SGG",
  ombNumber: "4040-0004",
})
@UI.sections(Sf424Section)
// Box 8d asks for the applicant's address but not its county, which every other form
// using this question does ask for. A form-scoped override, so the question stays one
// question.
@UI.overrides(#{ `applicant.county`: #{ omit: true } })
// Everything the runtime fills in before the applicant sees the form, in one place, keyed by
// the path an answer takes. Every path is checked against the form.
@Sgg.prePopulate(#{
  `samUei`: SggPrePop.uei,
  `agencyName`: SggPrePop.agencyName,
  `assistanceListingNumber`: SggPrePop.assistanceListingNumber,
  `assistanceListingProgramTitle`: SggPrePop.assistanceListingProgramTitle,
  `fundingOpportunityNumber`: SggPrePop.opportunityNumber,
  `fundingOpportunityTitle`: SggPrePop.opportunityTitle,
  `competitionIdentificationNumber`: SggPrePop.publicCompetitionId,
  `competitionIdentificationTitle`: SggPrePop.competitionTitle,
})
model SF424 {
  ...QuestionSf424SubmissionType;

  ...QuestionSf424ApplicationType;

  /** Completed by Grants.gov upon submission. */
  @UI.label("Date Received")
  @UI.section(Sf424Section.dateReceived)
  @UI.readOnly
  dateReceived?: DateReceived;

  /** Enter the applicant's control number, if applicable. */
  @UI.label("Applicant Identifier")
  @UI.section(Sf424Section.applicantIdentifier)
  applicantId?: Sf424ApplicantControlIdentifier;

  /** Enter the number assigned to your organization by the Federal agency. */
  @UI.label("Federal Entity Identifier")
  @UI.section(Sf424Section.federalIdentifiers)
  federalEntityIdentifier?: FederalEntityIdentifier;

  /** For new applications leave blank. For a continuation or revision to an existing award, enter the previously assigned Federal award identifier number. If a changed/corrected application, enter the Federal Identifier in accordance with agency instructions. */
  @UI.label("Federal Award Identifier")
  @UI.section(Sf424Section.federalAward)
  @Validation.requiredWhen(SF424.applicationType, Sf424ApplicationType.revision)
  @Validation.requiredWhen(SF424.applicationType, Sf424ApplicationType.continuation)
  federalAwardIdentifier?: Sf424FederalAwardIdentifier;

  /** Leave blank, to be filled out by state. */
  @UI.label("Date Received By State")
  @UI.section(Sf424Section.dateReceivedByState)
  @UI.readOnly
  stateReceiveDate?: StateReceivedDate;

  /** Leave blank, to be filled out by state. */
  @UI.label("State Application Identifier")
  @UI.section(Sf424Section.stateApplicationIdentifier)
  @UI.readOnly
  @minLength(0)
  @maxLength(30)
  stateApplicationId?: StateApplicationIdentifier;

  /** Enter the legal name of the applicant that will undertake the assistance activity. This is the organization that has registered with the System for Award Management (SAM). Information on registering with SAM may be obtained by visiting SAM.gov. */
  @UI.label("Legal Name")
  @UI.section(Sf424Section.applicantInformation)
  organizationName: LegalName;

  /** Enter either TIN or EIN as assigned by the Internal Revenue Service.  If your organization is not in the US, enter 44-4444444. */
  @UI.label("EIN/TIN")
  @UI.section(Sf424Section.applicantInformation)
  employerTaxpayerIdentificationNumber: EmployerIdentificationNumber;

  /** UEI of the applicant organization. This field is pre-populated from the Application cover sheet. */
  @UI.label("SAM UEI")
  @UI.section(Sf424Section.applicantInformation)
  samUei: SamUei;

  /** Enter information about the applicant. */
  @UI.label("Applicant")
  @UI.section(Sf424Section.applicantInformation)
  applicant: QuestionPrimaryOrgAddress;

  ...QuestionOrganizationalUnit;

  /** Enter information about the contact person. */
  @UI.label("Contact Person")
  @UI.section(Sf424Section.contactPerson)
  @Validation.requiredPaths("firstName", "lastName")
  contactPerson: QuestionPersonName;

  /** Enter the position title. */
  @UI.label("Title")
  @UI.section(Sf424Section.contactPerson)
  contactPersonTitle?: ContactTitle;

  /** Enter the organization if different from the applicant organization. */
  @UI.label("Organizational Affiliation")
  @UI.section(Sf424Section.contactPerson)
  organizationAffiliation?: PocOrganizationAffiliation;

  /** Enter the daytime Telephone Number. */
  @UI.label("Telephone Number")
  @UI.section(Sf424Section.contactPerson)
  phoneNumber: PhoneNumber;

  /** Enter the fax Number. */
  @UI.label("Fax Number")
  @UI.section(Sf424Section.contactPerson)
  fax?: PhoneNumber;

  /** Enter a valid email Address. */
  @UI.label("Email")
  @UI.section(Sf424Section.contactPerson)
  email: EmailAddress;

  /** Select the appropriate applicant types. */
  @UI.label("Type of Applicant")
  @UI.section(Sf424Section.typeOfApplicant)
  applicantTypeCode: ApplicantTypes;

  /** Enter the applicant type here if you selected "Other (specify)" for Type of applicant. */
  @UI.label("Type of Applicant Other Explanation")
  @UI.section(Sf424Section.typeOfApplicant)
  @Validation.requiredWhen(SF424.applicantTypeCode, ApplicantTypeCode.X)
  applicantTypeOtherSpecify?: ApplicantTypeOther;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Agency Name")
  @UI.section(Sf424Section.federalAgency)
  agencyName: AgencyName;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Assistance Listing Number")
  @UI.section(Sf424Section.assistanceListing)
  assistanceListingNumber?: AssistanceListingNumber;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Assistance Listing Title")
  @UI.section(Sf424Section.assistanceListing)
  assistanceListingProgramTitle?: AssistanceListingTitle;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Opportunity Number")
  @UI.section(Sf424Section.fundingOpportunity)
  fundingOpportunityNumber: OpportunityNumber;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Opportunity title")
  @UI.section(Sf424Section.fundingOpportunity)
  fundingOpportunityTitle: OpportunityTitle;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Competition Number")
  @UI.section(Sf424Section.competitionIdentification)
  competitionIdentificationNumber?: CompetitionNumber;

  /** Pre-populated from the Application cover sheet. */
  @UI.label("Competition Title")
  @UI.section(Sf424Section.competitionIdentification)
  competitionIdentificationTitle?: CompetitionTitle;

  /** List the areas or entities using the categories (e.g., cities, counties, states, etc.) specified in agency instructions. */
  @UI.label("Areas Affected")
  @UI.section(Sf424Section.areasAffected)
  @UI.widget(WidgetName.Attachment)
  areasAffected?: ProjectAreasAffected;

  /** Enter a brief, descriptive title of the project. */
  @UI.label("Project Title")
  @UI.section(Sf424Section.projectTitle)
  @Validation.constraints(#{ maxLength: 200 })
  projectTitle: ProjectTitle;

  /** Attach file(s) using the appropriate buttons. */
  @UI.label("Additional Project Title")
  @UI.section(Sf424Section.projectTitle)
  @UI.widget(WidgetName.AttachmentArray)
  @maxItems(100)
  additionalProjectTitle?: AdditionalProjectTitle[];

  /** Enter the Congressional District in the format: 2 character state Abbreviation - 3 character District Number. Examples: CA-005 for California's 5th district, CA-012 for California's 12th district.If outside the US, enter 00-000. */
  @UI.label("Applicant District")
  @UI.section(Sf424Section.congressionalDistricts)
  congressionalDistrictApplicant: CongressionalDistrict;

  /** Enter the Congressional District in the format: 2 character state Abbreviation - 3 character District Number. Examples: CA-005 for California's 5th district, CA-012 for California's 12th district.If all districts in a state are affected, enter "all" for the district number. Example: MD-all for all congressional districts in Maryland.If nationwide (all districts in all states), enter US-all.If the program/project is outside the US, enter 00-000. */
  @UI.label("Program District")
  @UI.section(Sf424Section.congressionalDistricts)
  congressionalDistrictProgramProject: CongressionalDistrict;

  /** Attach an additional list of Program/Project Congressional Districts if needed. */
  @UI.label("Additional Congressional Districts")
  @UI.section(Sf424Section.congressionalDistricts)
  @UI.widget(WidgetName.Attachment)
  additionalCongressionalDistricts?: AdditionalCongressionalDistricts;

  /** Enter the date in the format MM/DD/YYYY.  */
  @UI.label("Project Start Date")
  @UI.section(Sf424Section.projectDates)
  projectStartDate: ProjectStartDate;

  /** Enter the date in the format MM/DD/YYYY.  */
  @UI.label("Project End Date")
  @UI.section(Sf424Section.projectDates)
  projectEndDate: ProjectEndDate;

  /** Enter the dollar amount. */
  @UI.label("Federal Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  federalEstimatedFunding: MonetaryAmount;

  /** Enter the dollar amount. */
  @UI.label("Applicant Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  applicantEstimatedFunding: MonetaryAmount;

  /** Enter the dollar amount. */
  @UI.label("State Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  stateEstimatedFunding: MonetaryAmount;

  /** Enter the dollar amount. */
  @UI.label("Local Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  localEstimatedFunding: MonetaryAmount;

  /** Enter the dollar amount. */
  @UI.label("Other Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  otherEstimatedFunding: MonetaryAmount;

  /** Enter the dollar amount. */
  @UI.label("Program Income Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  programIncomeEstimatedFunding: MonetaryAmount;

  /** This field is automatically calculated by Grants.gov */
  @UI.label("Total Estimated Funding")
  @UI.section(Sf424Section.estimatedFunding)
  @UI.readOnly
  @Meta.role(ResponseRole.calculatedOutput)
  @Validation.computed(
    Op.Sum,
    SF424.federalEstimatedFunding,
    SF424.applicantEstimatedFunding,
    SF424.stateEstimatedFunding,
    SF424.localEstimatedFunding,
    SF424.otherEstimatedFunding,
    SF424.programIncomeEstimatedFunding
  )
  totalEstimatedFunding: MonetaryAmount;

  ...QuestionSf424StateReview;

  ...QuestionFederalDebtStatus;

  @UI.label("Debt Explanation")
  @UI.section(Sf424Section.federalDebt)
  @UI.widget(WidgetName.Attachment)
  @Validation.requiredWhen(SF424.delinquentFederalDebt, true)
  debtExplanation?: FederalDebtExplanation;

  /** By signing this application, I certify (1) to the statements contained in the list of certifications* and (2) that the statements herein are true, complete and accurate to the best of my knowledge. I also provide the required assurances** and agree to comply with any resulting terms if I accept an award. I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties. (U.S. Code, Title 18, Section 1001) */
  @UI.label("Certification Agree")
  @UI.section(Sf424Section.authorizedRepresentative)
  @Meta.role(ResponseRole.attestation)
  certificationAgree: boolean;

  @UI.label("Authorized Representative")
  @UI.section(Sf424Section.authorizedRepresentative)
  @Validation.requiredPaths("firstName", "lastName")
  authorizedRepresentative: QuestionAorName;

  /** Enter the position title. */
  @UI.label("Title")
  @UI.section(Sf424Section.authorizedRepresentative)
  authorizedRepresentativeTitle: AorTitle;

  /** Enter the daytime Telephone Number. */
  @UI.label("AOR Telephone Number")
  @UI.section(Sf424Section.authorizedRepresentative)
  authorizedRepresentativePhoneNumber: AorPhone;

  /** Enter the fax Number. */
  @UI.label("AOR fax Number")
  @UI.section(Sf424Section.authorizedRepresentative)
  authorizedRepresentativeFax?: AorFax;

  /** Enter a valid email Address. */
  @UI.label("AOR email")
  @UI.section(Sf424Section.authorizedRepresentative)
  authorizedRepresentativeEmail: AorEmail;

  @UI.label("AOR Signature")
  @UI.section(Sf424Section.authorizedRepresentative)
  @UI.readOnly
  aorSignature?: AorSignature;

  @UI.label("Date Signed")
  @UI.section(Sf424Section.authorizedRepresentative)
  @UI.readOnly
  dateSigned?: AorDateSigned;
}

@@UI.section(SF424.submissionType, Sf424Section.submissionType);
@@UI.section(SF424.applicationType, Sf424Section.applicationTypeAndRevision);
@@UI.section(SF424.revisionType, Sf424Section.applicationTypeAndRevision);
@@UI.section(SF424.revisionOtherSpecify, Sf424Section.applicationTypeAndRevision);
@@UI.section(SF424.departmentName, Sf424Section.organizationalUnit);
@@UI.section(SF424.divisionName, Sf424Section.organizationalUnit);
@@UI.section(SF424.stateReview, Sf424Section.stateReview);
@@UI.section(SF424.stateReviewAvailableDate, Sf424Section.stateReview);
@@UI.section(SF424.delinquentFederalDebt, Sf424Section.federalDebt);
