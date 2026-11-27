import "simpler-forms";

import "./form.tsp";

using SimplerForms;
namespace Forms.SF424Regular;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// One section per numbered paper item, in paper order, as the hand-written SGG form has.
// Each item's unnumbered companions, such as a title under its number, join its section.
// The first section to show part of a field lays the field out; later sections name the
// rest with `::type`, from the form root.
@UI.layout(SF424)
model SF424Layout {
  // ===========================================================================
  // ITEMS 1-7: SUBMISSION
  // ===========================================================================

  @UI.label("1. Type of Submission")
  @UI.field(SF424.application)
  application: {
    @UI.label("Type of Submission")
    submissionType: SF424Application.submissionType;
  };

  @UI.label("2. Type of Application")
  applicationType: {
    @UI.label("Type of Application")
    applicationType: SF424.application::type.applicationType;

    @UI.flatten
    @UI.field(SF424.application::type.revision)
    revision: {
      @UI.label("If Revision, select appropriate letter(s)")
      @UI.enabledWhen(
        SF424.application::type.applicationType,
        SF424ApplicationType.Revision
      )
      type: SF424Revision.type;

      @UI.label("Other (specify)")
      otherSpecify: SF424Revision.otherSpecify;
    };
  };

  @UI.label("3. Date Received")
  dateReceived: {
    @UI.label("Date Received")
    dateReceived: SF424.application::type.dateReceived;
  };

  @UI.label("4. Applicant Identifier")
  applicantId: {
    @UI.label("Applicant Identifier")
    applicantId: SF424.application::type.applicantId;
  };

  @UI.label("5. Federal Identifiers")
  federalIdentifiers: {
    @UI.label("5a. Federal Entity Identifier")
    federalEntityIdentifier: SF424.application::type.federalEntityIdentifier;

    @UI.label("5b. Federal Award Identifier")
    federalAwardIdentifier: SF424.application::type.federalAwardIdentifier;
  };

  @UI.label("6. Date Received by State")
  stateReceivedDate: {
    @UI.label("Date Received by State")
    receivedDate: SF424.application::type.state::type.receivedDate;
  };

  @UI.label("7. State Application Identifier")
  stateApplicationId: {
    @UI.label("State Application Identifier")
    applicationId: SF424.application::type.state::type.applicationId;
  };

  // ===========================================================================
  // ITEMS 8-9: APPLICANT
  // ===========================================================================

  // Show the paper's lettered blocks 8d, 8e and 8f as labeled groups inside item 8.
  @UI.label("8. Applicant Information")
  @UI.field(SF424.applicant)
  applicant: {
    @UI.flatten
    @UI.field(SF424Applicant.organization)
    organization: {
      @UI.label("8a. Legal Name")
      name: SF424ApplicantOrganization.name;

      @UI.label("8b. Employer/Taxpayer Identification Number (EIN/TIN)")
      ein: SF424ApplicantOrganization.ein;

      @UI.label("8c. UEI")
      uei: SF424ApplicantOrganization.uei;

      @UI.label("8d. Address")
      address: SF424ApplicantOrganization.address;

      // Department and division sit on the organization, so group them here.
      @UI.label("8e. Organizational Unit")
      organizationalUnit: {
        @UI.label("Department Name")
        department: SF424ApplicantOrganization.department;

        @UI.label("Division Name")
        division: SF424ApplicantOrganization.division;
      };
    };

    @UI.flatten
    @UI.field(SF424.contacts)
    contacts: {
      /** Name and contact information of person to be contacted on matters involving this application. */
      @UI.label("8f. Contact Person")
      @UI.field(SF424Contacts.pointOfContact)
      pointOfContact: {
        @UI.flatten name: SF424PointOfContact.name;

        @UI.label("Title")
        title: SF424PointOfContact.title;

        @UI.flatten
        @UI.field(SF424PointOfContact.organization)
        organization: {
          @UI.label("Organizational Affiliation")
          name: SF424ContactOrganization.name;
        };

        @UI.label("Phone Number")
        phone: SF424PointOfContact.phone;

        @UI.label("Fax Number")
        fax: SF424PointOfContact.fax;

        @UI.label("Email")
        email: SF424PointOfContact.email;
      };
    };
  };

  @UI.label("9. Type of Applicant")
  @UI.field(SF424.applicant::type.type)
  type: {
    @UI.label("Type of Applicant")
    codes: SF424ApplicantType.codes;

    @UI.label("Other (specify)")
    otherSpecify: SF424ApplicantType.otherSpecify;
  };

  // ===========================================================================
  // ITEMS 10-13: OPPORTUNITY
  // ===========================================================================

  @UI.label("10. Name of Federal Agency")
  @UI.field(SF424.opportunity)
  opportunity: {
    @UI.label("Name of Federal Agency")
    agencyName: SF424Opportunity.agencyName;
  };

  @UI.label("11. Assistance Listing")
  assistanceListing: {
    @UI.flatten assistanceListing: SF424.opportunity::type.assistanceListing;
  };

  @UI.label("12. Funding Opportunity")
  fundingOpportunity: {
    @UI.label("Funding Opportunity Number")
    number: SF424.opportunity::type.number;

    @UI.label("Funding Opportunity Title")
    title: SF424.opportunity::type.title;
  };

  @UI.label("13. Competition Identification")
  @UI.field(SF424.opportunity::type.competition)
  competition: {
    @UI.label("Competition Identification Number")
    number: SF424Competition.number;

    @UI.label("Competition Identification Title")
    title: SF424Competition.title;
  };

  // ===========================================================================
  // ITEMS 14-17: PROJECT
  // ===========================================================================

  @UI.label("14. Areas Affected by Project")
  @UI.field(SF424.project)
  project: {
    @UI.label("Areas Affected by Project (Cities, Counties, States, etc.)")
    areasAffected: SF424Project.areasAffected;
  };

  @UI.label("15. Descriptive Title of Applicant's Project")
  projectTitle: {
    @UI.label("Descriptive Title of Applicant's Project")
    title: SF424.project::type.title;

    /** Attach supporting documents as specified in agency instructions. */
    @UI.label("Additional Project Title")
    additionalTitles: SF424.project::type.additionalTitles;
  };

  // Item 16a asks for the applicant's district beside the project's.
  @UI.label("16. Congressional Districts Of")
  congressionalDistricts: {
    @UI.label("16a. Applicant")
    applicant: SF424.applicant::type.congressionalDistrict;

    @UI.label("16b. Program/Project")
    congressionalDistrict: SF424.project::type.congressionalDistrict;

    @UI.label("Additional Congressional Districts")
    additionalCongressionalDistricts: SF424.project::type.additionalCongressionalDistricts;
  };

  @UI.label("17. Proposed Project")
  @UI.field(SF424.project::type.timeline)
  timeline: {
    @UI.label("17a. Start Date")
    startDate: SF424ProjectTimeline.startDate;

    @UI.label("17b. End Date")
    endDate: SF424ProjectTimeline.endDate;
  };

  // ===========================================================================
  // ITEMS 18-20: FUNDING, STATE REVIEW AND FEDERAL DEBT
  // ===========================================================================

  @UI.label("18. Estimated Funding ($)")
  @UI.field(SF424.budget)
  budget: {
    @UI.flatten
    @UI.field(SF424Budget.fundingSources)
    fundingSources: {
      @UI.label("18a. Federal")
      federal: SF424FundingSources.federal;

      @UI.label("18b. Applicant")
      applicant: SF424FundingSources.applicant;

      @UI.label("18c. State")
      state: SF424FundingSources.state;

      @UI.label("18d. Local")
      local: SF424FundingSources.local;

      @UI.label("18e. Other")
      other: SF424FundingSources.other;

      @UI.label("18f. Program Income")
      programIncome: SF424FundingSources.programIncome;

      @UI.label("18g. Total")
      total: SF424FundingSources.total;
    };
  };

  @UI.label("19. Is Application Subject to Review By State Under Executive Order 12372 Process?")
  @UI.field(SF424.application::type.stateReview)
  stateReview: {
    @UI.label("Is Application Subject to Review By State Under Executive Order 12372 Process?")
    status: SF424StateReview.status;

    @UI.label("State Review Date")
    date: SF424StateReview.date;
  };

  @UI.label("20. Is the Applicant Delinquent On Any Federal Debt?")
  @UI.field(SF424.applicant::type.delinquentFederalDebt)
  delinquentFederalDebt: {
    @UI.label("Is the Applicant Delinquent On Any Federal Debt?")
    answer: SF424DelinquentFederalDebt.answer;

    @UI.label("Delinquent Debt Explanation")
    explanation: SF424DelinquentFederalDebt.explanation;
  };

  // ===========================================================================
  // ITEM 21: CERTIFICATION
  // ===========================================================================

  /**
   * *By signing this application, I certify (1) to the statements contained in the list of certifications** and (2) that the statements herein are true, complete and accurate to the best of my knowledge. I also provide the required assurances** and agree to comply with any resulting terms if I accept an award. I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties. (U.S. Code, Title 18, Section 1001)
   *
   * ** The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.
   */
  @UI.label("21. Certification")
  @UI.field(SF424.certification)
  certification: {
    @UI.label("I Agree")
    agree: Questions.Certifications.Certification.agree;

    // Grants.gov signs and dates the certification in the representative's name, so show
    // the signature and date at the end of the representative's block.
    @UI.label("Authorized Representative")
    @UI.field(SF424.contacts::type.authorizedRepresentative)
    authorizedRepresentative: {
      @UI.flatten name: SF424AuthorizedRepresentative.name;

      @UI.label("Title")
      title: SF424AuthorizedRepresentative.title;

      @UI.label("Phone Number")
      phone: SF424AuthorizedRepresentative.phone;

      @UI.label("Fax Number")
      fax: SF424AuthorizedRepresentative.fax;

      @UI.label("Email")
      email: SF424AuthorizedRepresentative.email;

      @UI.label("Signature of Authorized Representative")
      signature: SF424.certification::type.signature;

      @UI.label("Date Signed")
      dateSigned: SF424.certification::type.dateSigned;
    };
  };
}
