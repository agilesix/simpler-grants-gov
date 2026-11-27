import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.SF424Mandatory;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// One section per numbered paper item, in DAT order. Each item's unnumbered companions,
// such as the Assistance Listing Title, join its section. The first section to show part
// of a field lays the field out; later sections name the rest with `::type`, from the form
// root.
@UI.layout(SF424Mandatory)
model MandatoryLayout {
  // ===========================================================================
  // ITEMS 1-6: SUBMISSION
  // ===========================================================================

  @UI.label("1. Type of Submission")
  @UI.field(SF424Mandatory.application)
  application: {
    @UI.label("1a. Type of Submission")
    submissionType: MandatoryApplication.submissionType;

    @UI.label("Type of Submission - Other (specify)")
    submissionTypeOther: MandatoryApplication.submissionTypeOther;

    @UI.flatten
    @UI.field(MandatoryApplication.frequency)
    frequency: {
      @UI.label("1b. Frequency")
      code: MandatoryFrequency.code;

      @UI.label("Frequency - Other (specify)")
      other: MandatoryFrequency.other;
    };

    @UI.flatten
    @UI.field(MandatoryApplication.consolidatedRequest)
    consolidatedRequest: {
      @UI.label("1c. Consolidated Application/Plan/Funding Request?")
      answer: MandatoryConsolidatedRequest.answer;

      @UI.label("Consolidated Application/Plan/Funding Request Explanation")
      explanation: MandatoryConsolidatedRequest.explanation;
    };

    @UI.label("1d. Version")
    version: MandatoryApplication.version;
  };

  @UI.label("2. Date Received")
  dateReceived: {
    @UI.label("Date Received")
    dateReceived: SF424Mandatory.application::type.dateReceived;
  };

  @UI.label("3. Applicant Identifier")
  applicantId: {
    @UI.label("Applicant Identifier")
    applicantId: SF424Mandatory.application::type.applicantId;
  };

  @UI.label("4. Federal Identifiers")
  federalIdentifiers: {
    @UI.label("4a. Federal Entity Identifier")
    federalEntityIdentifier: SF424Mandatory.application::type.federalEntityIdentifier;

    @UI.label("4b. Federal Award Identifier")
    federalAwardIdentifier: SF424Mandatory.application::type.federalAwardIdentifier;
  };

  @UI.label("5. Date Received by State")
  stateReceivedDate: {
    @UI.label("Date Received by State")
    receivedDate: SF424Mandatory.application::type.state::type.receivedDate;
  };

  @UI.label("6. State Application Identifier")
  stateApplicationId: {
    @UI.label("State Application Identifier")
    applicationId: SF424Mandatory.application::type.state::type.applicationId;
  };

  // ===========================================================================
  // ITEMS 7-8: APPLICANT
  // ===========================================================================

  // Show the paper's lettered blocks 7d, 7e and 7f as labeled groups inside item 7.
  @UI.label("7. Applicant Information")
  @UI.field(SF424Mandatory.applicant)
  applicant: {
    @UI.flatten
    @UI.field(MandatoryApplicant.organization)
    organization: {
      @UI.label("7a. Legal Name")
      name: MandatoryApplicantOrganization.name;

      @UI.label("7b. Employer/Taxpayer Identification Number (EIN/TIN)")
      ein: MandatoryApplicantOrganization.ein;

      @UI.label("7c. UEI")
      uei: MandatoryApplicantOrganization.uei;

      @UI.label("7d. Address")
      address: MandatoryApplicantOrganization.address;

      // Department and division are organization fields, so group them here.
      @UI.label("7e. Organizational Unit")
      organizationalUnit: {
        @UI.label("Department Name")
        department: MandatoryApplicantOrganization.department;

        @UI.label("Division Name")
        division: MandatoryApplicantOrganization.division;
      };
    };

    @UI.flatten
    @UI.field(SF424Mandatory.contacts)
    contacts: {
      /** Name and contact information of person to be contacted on matters involving this submission. */
      @UI.label("7f. Contact Person")
      @UI.field(MandatoryContacts.pointOfContact)
      pointOfContact: {
        @UI.flatten name: MandatoryPointOfContact.name;

        @UI.label("Title")
        title: MandatoryPointOfContact.title;

        @UI.flatten
        @UI.field(MandatoryPointOfContact.organization)
        organization: {
          @UI.label("Organizational Affiliation")
          name: MandatoryContactOrganization.name;
        };

        @UI.label("Phone Number")
        phone: MandatoryPointOfContact.phone;

        @UI.label("Fax Number")
        fax: MandatoryPointOfContact.fax;

        @UI.label("Email")
        email: MandatoryPointOfContact.email;
      };
    };
  };

  @UI.label("8. Type of Applicant")
  @UI.field(SF424Mandatory.applicant::type.type)
  type: {
    @UI.label("8a. Type of Applicant")
    code: MandatoryApplicantType.code;

    @UI.label("Other (specify)")
    otherSpecify: MandatoryApplicantType.otherSpecify;

    @UI.label("8b. Additional Description")
    additionalDescription: MandatoryApplicantType.additionalDescription;
  };

  // ===========================================================================
  // ITEMS 9-10: OPPORTUNITY
  // ===========================================================================

  @UI.label("9. Name of Federal Agency")
  @UI.field(SF424Mandatory.opportunity)
  opportunity: {
    @UI.label("Name of Federal Agency")
    agencyName: MandatoryOpportunity.agencyName;
  };

  @UI.label("10. Assistance Listing")
  assistanceListing: {
    @UI.flatten
    assistanceListing: SF424Mandatory.opportunity::type.assistanceListing;
  };

  // ===========================================================================
  // ITEMS 11-15: PROJECT AND FUNDING
  // ===========================================================================

  @UI.label("11. Descriptive Title of Applicant's Project")
  @UI.field(SF424Mandatory.project)
  project: {
    @UI.label("Descriptive Title of Applicant's Project")
    title: MandatoryProject.title;
  };

  @UI.label("12. Areas Affected by Funding")
  areasAffected: {
    @UI.label("Areas Affected by Funding")
    areasAffected: SF424Mandatory.project::type.areasAffected;
  };

  // Item 13a asks for the applicant's district beside the project's.
  @UI.label("13. Congressional Districts Of")
  congressionalDistricts: {
    @UI.label("13a. Applicant")
    applicant: SF424Mandatory.applicant::type.congressionalDistrict;

    @UI.label("13b. Program/Project")
    project: SF424Mandatory.project::type.congressionalDistrict;

    /** Attach an additional list of Program/Project Congressional Districts if needed. */
    @UI.label("Additional Program/Project Congressional Districts")
    additionalCongressionalDistricts: SF424Mandatory.project::type.additionalCongressionalDistricts;
  };

  @UI.label("14. Funding Period")
  @UI.field(SF424Mandatory.budget)
  budget: {
    @UI.flatten
    @UI.field(MandatoryBudget.fundingPeriod)
    fundingPeriod: {
      @UI.label("14a. Start Date")
      startDate: MandatoryFundingPeriod.startDate;

      @UI.label("14b. End Date")
      endDate: MandatoryFundingPeriod.endDate;
    };
  };

  @UI.label("15. Estimated Funding")
  @UI.field(SF424Mandatory.budget::type.fundingSources)
  fundingSources: {
    @UI.label("15a. Federal")
    federal: MandatoryFundingSources.federal;

    @UI.label("15b. Match")
    match: MandatoryFundingSources.match;
  };

  // ===========================================================================
  // ITEMS 16-17: STATE REVIEW AND FEDERAL DEBT
  // ===========================================================================

  @UI.label("16. Is Submission Subject to Review by State Under Executive Order 12372 Process?")
  @UI.field(SF424Mandatory.application::type.stateReview)
  stateReview: {
    @UI.label("Is Submission Subject to Review by State Under Executive Order 12372 Process?")
    status: MandatoryStateReview.status;

    @UI.label("State Review Date")
    date: MandatoryStateReview.date;
  };

  @UI.label("17. Is the Applicant Delinquent on Any Federal Debt?")
  @UI.field(SF424Mandatory.applicant::type.delinquentFederalDebt)
  delinquentFederalDebt: {
    @UI.label("Is the Applicant Delinquent on Any Federal Debt?")
    answer: MandatoryDelinquentFederalDebt.answer;

    @UI.label("Applicant Federal Debt Delinquency Explanation")
    explanation: MandatoryDelinquentFederalDebt.explanation;
  };

  // ===========================================================================
  // ITEM 18: CERTIFICATION
  // ===========================================================================

  /**
   * By signing this application, I certify (1) to the statements contained in the list of certifications** and (2) that the statements herein are true, complete and accurate to the best of my knowledge. I also provide the required assurances** and agree to comply with any resulting terms if I accept an award. I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties. (U.S. Code, Title 18, Section 1001)
   *
   * ** This list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.
   */
  @UI.label("18. Certification")
  @UI.field(SF424Mandatory.certification)
  certification: {
    @UI.label("I Agree")
    agree: Questions.Certifications.Certification.agree;

    // Grants.gov signs and dates the certification in the representative's name, so show
    // the signature and date at the end of the representative's block.
    @UI.label("Authorized Representative")
    @UI.field(SF424Mandatory.contacts::type.authorizedRepresentative)
    authorizedRepresentative: {
      @UI.flatten name: MandatoryAuthorizedRepresentative.name;

      @UI.label("Title")
      title: MandatoryAuthorizedRepresentative.title;

      @UI.flatten
      @UI.field(MandatoryAuthorizedRepresentative.organization)
      organization: {
        @UI.label("Organizational Affiliation")
        name: MandatoryRepresentativeOrganization.name;
      };

      @UI.label("Phone Number")
      phone: MandatoryAuthorizedRepresentative.phone;

      @UI.label("Fax Number")
      fax: MandatoryAuthorizedRepresentative.fax;

      @UI.label("Email")
      email: MandatoryAuthorizedRepresentative.email;

      @UI.label("Signature of Authorized Representative")
      signature: SF424Mandatory.certification::type.signature;

      @UI.label("Date Signed")
      dateSigned: SF424Mandatory.certification::type.dateSigned;
    };

    // DAT 18-12 files the supporting documents under item 18.
    @UI.flatten
    @UI.field(SF424Mandatory.attachments)
    attachments: {
      @UI.label("Supporting Documents")
      additional: MandatoryAttachments.additional;
    };
  };
}
