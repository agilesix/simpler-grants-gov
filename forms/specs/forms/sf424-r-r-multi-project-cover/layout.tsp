import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.SF424ResearchMultiProject;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// R&R's sections, in the same order: one section per numbered paper item, in DAT order.
// Each item's unnumbered companions, such as the identifier beside its date, join its
// section. The first section to show part of a field lays the field out; later sections
// name the rest with `::type`, from the form root.
@UI.layout(MultiProjectCover)
model MultiProjectCoverLayout {
  // ===========================================================================
  // ITEMS 1-4: SUBMISSION
  // ===========================================================================

  @UI.label("1. Type of Submission")
  @UI.field(MultiProjectCover.application)
  application: {
    @UI.label("Type of Submission")
    submissionType: MultiProjectApplication.submissionType;
  };

  @UI.label("2. Date Submitted")
  dateSubmitted: {
    @UI.label("Date Submitted")
    dateSubmitted: MultiProjectCover.application::type.dateSubmitted;

    @UI.label("Applicant Identifier")
    applicantId: MultiProjectCover.application::type.applicantId;
  };

  @UI.label("3. Date Received by State")
  @UI.field(MultiProjectCover.application::type.state)
  state: {
    @UI.label("Date Received by State")
    receivedDate: Forms.SF424Research.ResearchStateApplication.receivedDate;

    @UI.label("State Application Identifier")
    applicationId: Forms.SF424Research.ResearchStateApplication.applicationId;
  };

  @UI.label("4. Federal Identifiers")
  federalIdentifiers: {
    @UI.label("4a. Federal Identifier")
    federalIdentifier: MultiProjectCover.application::type.federalIdentifier;

    @UI.label("4b. Agency Routing Identifier")
    agencyRoutingNumber: MultiProjectCover.application::type.agencyRoutingNumber;

    @UI.label("4c. Previous Grants.gov Tracking ID")
    previousTrackingId: MultiProjectCover.application::type.previousTrackingId;
  };

  // ===========================================================================
  // ITEMS 5-7: APPLICANT
  // ===========================================================================

  @UI.label("5. Applicant Information")
  @UI.field(MultiProjectCover.applicant)
  applicant: {
    @UI.flatten
    @UI.field(MultiProjectApplicant.organization)
    organization: {
      @UI.label("UEI")
      uei: MultiProjectOrganization.uei;

      @UI.label("Legal Name")
      name: MultiProjectOrganization.name;

      @UI.label("Department Name")
      department: MultiProjectOrganization.department;

      @UI.label("Division Name")
      division: MultiProjectOrganization.division;

      @UI.flatten address: MultiProjectOrganization.address;
    };

    // Show the paper's printed contact caption as a labeled group inside item 5.
    @UI.flatten
    @UI.field(MultiProjectCover.contacts)
    contacts: {
      @UI.label("Person to Be Contacted on Matters Involving This Application")
      @UI.field(MultiProjectContacts.pointOfContact)
      pointOfContact: {
        @UI.flatten name: MultiProjectContactPerson.name;
        title: MultiProjectContactPerson.title;
        @UI.flatten address: MultiProjectContactPerson.address;
        phone: MultiProjectContactPerson.phone;
        fax: MultiProjectContactPerson.fax;
        email: MultiProjectContactPerson.email;
      };
    };
  };

  @UI.label("6. Employer Identification (EIN) or (TIN)")
  ein: {
    @UI.label("Employer Identification (EIN) or (TIN)")
    ein: MultiProjectCover.applicant::type.organization::type.ein;
  };

  @UI.label("7. Type of Applicant")
  @UI.field(MultiProjectCover.applicant::type.type)
  type: {
    @UI.label("Type of Applicant")
    code: MultiProjectApplicantType.code;

    @UI.label("Other (specify)")
    otherSpecify: MultiProjectApplicantType.otherSpecify;

    smallBusiness: MultiProjectApplicantType.smallBusiness;
  };

  // ===========================================================================
  // ITEMS 8-10: APPLICATION TYPE AND OPPORTUNITY
  // ===========================================================================

  @UI.label("8. Type of Application")
  applicationType: {
    @UI.label("Type of Application")
    applicationType: MultiProjectCover.application::type.applicationType;

    @UI.flatten
    @UI.field(MultiProjectCover.application::type.revision)
    revision: {
      @UI.label("If Revision, Type of Revision")
      @UI.enabledWhen(
        MultiProjectCover.application::type.applicationType,
        Forms.SF424Research.ResearchApplicationType.Revision
      )
      type: MultiProjectRevision.type;

      @UI.label("Other (specify)")
      otherSpecify: MultiProjectRevision.otherSpecify;
    };

    @UI.flatten
    @UI.field(MultiProjectCover.application::type.otherAgencies)
    otherAgencies: {
      @UI.label("Is this application being submitted to other agencies?")
      submitted: MultiProjectOtherAgencies.submitted;

      @UI.label("What other agencies?")
      explanation: MultiProjectOtherAgencies.explanation;
    };
  };

  @UI.label("9. Name of Federal Agency")
  @UI.field(MultiProjectCover.opportunity)
  opportunity: {
    @UI.label("Name of Federal Agency")
    agencyName: MultiProjectOpportunity.agencyName;
  };

  // Give the listing R&R's own DAT help; the shared model words it for the other variants.
  @UI.label("10. Assistance Listing")
  @UI.field(MultiProjectCover.opportunity::type.assistanceListing)
  assistanceListing: {
    /** This is the Assistance Listing number of the program under which assistance is requested. This field is pre-populated from the opportunity package. */
    number: Questions.Opportunities.AssistanceListing.number;

    /** This is the Assistance Listing title of the program under which assistance is requested. This field is pre-populated from the opportunity package. */
    title: Questions.Opportunities.AssistanceListing.title;
  };

  // ===========================================================================
  // ITEMS 11-14: PROJECT
  // ===========================================================================

  @UI.label("11. Descriptive Title of Applicant's Project")
  @UI.field(MultiProjectCover.project)
  project: {
    @UI.label("Descriptive Title of Applicant's Project")
    title: MultiProjectProject.title;
  };

  @UI.label("12. Proposed Project")
  @UI.field(MultiProjectCover.project::type.timeline)
  timeline: {
    @UI.label("Start Date")
    startDate: MultiProjectTimeline.startDate;

    @UI.label("Ending Date")
    endDate: MultiProjectTimeline.endDate;
  };

  @UI.label("13. Congressional District of Applicant")
  congressionalDistrict: {
    @UI.label("Congressional District of Applicant")
    congressionalDistrict: MultiProjectCover.applicant::type.congressionalDistrict;
  };

  @UI.label("14. Project Director/Principal Investigator Contact Information")
  @UI.field(MultiProjectCover.contacts::type.projectDirector)
  projectDirector: {
    @UI.flatten name: MultiProjectContact.name;
    title: MultiProjectContact.title;

    @UI.flatten
    @UI.field(MultiProjectContact.organization)
    organization: {
      name: MultiProjectPersonOrganization.name;

      @UI.label("Department Name")
      department: MultiProjectPersonOrganization.department;

      @UI.label("Division Name")
      division: MultiProjectPersonOrganization.division;
    };

    @UI.flatten address: MultiProjectContact.address;
    phone: MultiProjectContact.phone;
    fax: MultiProjectContact.fax;
    email: MultiProjectContact.email;
  };

  // ===========================================================================
  // ITEMS 15-17: FUNDING, STATE REVIEW AND CERTIFICATION
  // ===========================================================================

  @UI.label("15. Estimated Project Funding")
  @UI.field(MultiProjectCover.budget)
  budget: {
    @UI.flatten
    @UI.field(MultiProjectBudget.fundingSources)
    fundingSources: {
      @UI.label("15a. Total Federal Funds Requested")
      federal: MultiProjectFundingSources.federal;

      @UI.label("15b. Total Non-Federal Funds")
      nonFederal: MultiProjectFundingSources.nonFederal;

      @UI.label("15c. Total Federal & Non-Federal Funds")
      total: MultiProjectFundingSources.total;

      @UI.label("15d. Estimated Program Income")
      programIncome: MultiProjectFundingSources.programIncome;
    };
  };

  @UI.label("16. State Review")
  @UI.field(MultiProjectCover.application::type.stateReview)
  stateReview: {
    @UI.label("Is Application Subject to Review by State Executive Order 12372 Process?")
    status: MultiProjectStateReview.status;

    @UI.label("Date")
    date: MultiProjectStateReview.date;
  };

  /**
   * By signing this application, I certify (1) to the statements contained in the list of certifications* and (2) that the statements herein are true, complete and accurate to the best of my knowledge. I also provide the required assurances* and agree to comply with any resulting terms if I accept an award. I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties. (U.S. Code, Title 18, Section 1001)
   *
   * * The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.
   */
  @UI.label("17. Certification")
  @UI.field(MultiProjectCover.certification)
  certification: {
    /** Check "I agree" to provide the required certifications and assurances. */
    @UI.label("I agree")
    agree: MultiProjectCertification.agree;
  };

  // ===========================================================================
  // ITEMS 18-21: AUTHORIZED REPRESENTATIVE AND ATTACHMENTS
  // ===========================================================================

  @UI.label("18. SF-LLL (Disclosure of Lobbying Activities) or Other Explanatory Documentation")
  @UI.field(MultiProjectCover.attachments)
  attachments: {
    @UI.label("SF-LLL or Other Explanatory Documentation")
    lobbyingDisclosure: Forms.SF424Research.ResearchAttachments.lobbyingDisclosure;
  };

  // Grants.gov signs and dates the certification in the representative's name, so show
  // the signature and date at the end of item 19, where the paper prints them.
  @UI.label("19. Authorized Representative")
  @UI.field(MultiProjectCover.contacts::type.authorizedRepresentative)
  authorizedRepresentative: {
    @UI.flatten name: MultiProjectContact.name;
    title: MultiProjectContact.title;

    @UI.flatten
    @UI.field(MultiProjectContact.organization)
    organization: {
      name: MultiProjectPersonOrganization.name;

      @UI.label("Department Name")
      department: MultiProjectPersonOrganization.department;

      @UI.label("Division Name")
      division: MultiProjectPersonOrganization.division;
    };

    @UI.flatten address: MultiProjectContact.address;
    phone: MultiProjectContact.phone;
    fax: MultiProjectContact.fax;
    email: MultiProjectContact.email;

    @UI.label("Signature of Authorized Representative")
    signature: MultiProjectCover.certification::type.signature;

    dateSigned: MultiProjectCover.certification::type.dateSigned;
  };

  @UI.label("20. Pre-application")
  preApplication: {
    @UI.label("Pre-application")
    preApplication: MultiProjectCover.attachments::type.preApplication;
  };

  @UI.label("21. Cover Letter Attachment")
  coverLetter: {
    @UI.label("Cover Letter Attachment")
    coverLetter: MultiProjectCover.attachments::type.coverLetter;
  };
}
