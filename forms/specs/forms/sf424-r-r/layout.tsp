import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.SF424Research;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// One section per numbered paper item, in paper order. Each item's unnumbered companions,
// such as the identifier beside its date, join its section. The first section to show part
// of a field lays the field out; later sections name the rest with `::type`, from the form
// root.
@UI.layout(ResearchCover)
model ResearchCoverLayout {
  // ===========================================================================
  // ITEMS 1-4: SUBMISSION
  // ===========================================================================

  @UI.label("1. Type of Submission")
  @UI.field(ResearchCover.application)
  application: {
    @UI.label("Type of Submission")
    submissionType: ResearchApplication.submissionType;
  };

  @UI.label("2. Date Submitted")
  dateSubmitted: {
    @UI.label("Date Submitted")
    dateSubmitted: ResearchCover.application::type.dateSubmitted;

    @UI.label("Applicant Identifier")
    applicantId: ResearchCover.application::type.applicantId;
  };

  @UI.label("3. Date Received by State")
  @UI.field(ResearchCover.application::type.state)
  state: {
    @UI.label("Date Received by State")
    receivedDate: ResearchStateApplication.receivedDate;

    @UI.label("State Application Identifier")
    applicationId: ResearchStateApplication.applicationId;
  };

  @UI.label("4. Federal Identifiers")
  federalIdentifiers: {
    @UI.label("4a. Federal Identifier")
    federalIdentifier: ResearchCover.application::type.federalIdentifier;

    @UI.label("4b. Agency Routing Identifier")
    agencyRoutingNumber: ResearchCover.application::type.agencyRoutingNumber;

    @UI.label("4c. Previous Grants.gov Tracking ID")
    previousTrackingId: ResearchCover.application::type.previousTrackingId;
  };

  // ===========================================================================
  // ITEMS 5-7: APPLICANT
  // ===========================================================================

  @UI.label("5. Applicant Information")
  @UI.field(ResearchCover.applicant)
  applicant: {
    @UI.flatten
    @UI.field(ResearchApplicant.organization)
    organization: {
      @UI.label("UEI")
      uei: ResearchOrganization.uei;

      @UI.label("Legal Name")
      name: ResearchOrganization.name;

      @UI.label("Department Name")
      department: ResearchOrganization.department;

      @UI.label("Division Name")
      division: ResearchOrganization.division;

      @UI.flatten address: ResearchOrganization.address;
    };

    // Show the paper's printed contact caption as a labeled group inside item 5.
    @UI.flatten
    @UI.field(ResearchCover.contacts)
    contacts: {
      @UI.label("Person to Be Contacted on Matters Involving This Application")
      @UI.field(ResearchContacts.pointOfContact)
      pointOfContact: {
        @UI.flatten name: ResearchContactPerson.name;
        title: ResearchContactPerson.title;
        @UI.flatten address: ResearchContactPerson.address;
        phone: ResearchContactPerson.phone;
        fax: ResearchContactPerson.fax;
        email: ResearchContactPerson.email;
      };
    };
  };

  @UI.label("6. Employer Identification (EIN) or (TIN)")
  ein: {
    @UI.label("Employer Identification (EIN) or (TIN)")
    ein: ResearchCover.applicant::type.organization::type.ein;
  };

  @UI.label("7. Type of Applicant")
  @UI.field(ResearchCover.applicant::type.type)
  type: {
    @UI.label("Type of Applicant")
    code: ResearchApplicantType.code;

    @UI.label("Other (specify)")
    otherSpecify: ResearchApplicantType.otherSpecify;

    smallBusiness: ResearchApplicantType.smallBusiness;
  };

  // ===========================================================================
  // ITEMS 8-10: APPLICATION TYPE AND OPPORTUNITY
  // ===========================================================================

  @UI.label("8. Type of Application")
  applicationType: {
    @UI.label("Type of Application")
    applicationType: ResearchCover.application::type.applicationType;

    @UI.flatten
    @UI.field(ResearchCover.application::type.revision)
    revision: {
      @UI.label("If Revision, Type of Revision")
      @UI.enabledWhen(
        ResearchCover.application::type.applicationType,
        ResearchApplicationType.Revision
      )
      type: ResearchRevision.type;

      @UI.label("Other (specify)")
      otherSpecify: ResearchRevision.otherSpecify;
    };

    @UI.flatten
    @UI.field(ResearchCover.application::type.otherAgencies)
    otherAgencies: {
      @UI.label("Is this application being submitted to other agencies?")
      submitted: ResearchOtherAgencies.submitted;

      @UI.label("What other agencies?")
      explanation: ResearchOtherAgencies.explanation;
    };
  };

  @UI.label("9. Name of Federal Agency")
  @UI.field(ResearchCover.opportunity)
  opportunity: {
    @UI.label("Name of Federal Agency")
    agencyName: ResearchOpportunity.agencyName;
  };

  // Give the listing R&R's own DAT help; the shared model words it for the other variants.
  @UI.label("10. Assistance Listing")
  @UI.field(ResearchCover.opportunity::type.assistanceListing)
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
  @UI.field(ResearchCover.project)
  project: {
    @UI.label("Descriptive Title of Applicant's Project")
    title: ResearchProject.title;
  };

  @UI.label("12. Proposed Project")
  @UI.field(ResearchCover.project::type.timeline)
  timeline: {
    @UI.label("Start Date")
    startDate: ResearchTimeline.startDate;

    @UI.label("Ending Date")
    endDate: ResearchTimeline.endDate;
  };

  @UI.label("13. Congressional District of Applicant")
  congressionalDistrict: {
    @UI.label("Congressional District of Applicant")
    congressionalDistrict: ResearchCover.applicant::type.congressionalDistrict;
  };

  @UI.label("14. Project Director/Principal Investigator Contact Information")
  @UI.field(ResearchCover.contacts::type.projectDirector)
  projectDirector: {
    @UI.flatten name: ResearchContact.name;
    title: ResearchContact.title;

    @UI.flatten
    @UI.field(ResearchContact.organization)
    organization: {
      name: ResearchPersonOrganization.name;

      @UI.label("Department Name")
      department: ResearchPersonOrganization.department;

      @UI.label("Division Name")
      division: ResearchPersonOrganization.division;
    };

    @UI.flatten address: ResearchContact.address;
    phone: ResearchContact.phone;
    fax: ResearchContact.fax;
    email: ResearchContact.email;
  };

  // ===========================================================================
  // ITEMS 15-17: FUNDING, STATE REVIEW AND CERTIFICATION
  // ===========================================================================

  @UI.label("15. Estimated Project Funding")
  @UI.field(ResearchCover.budget)
  budget: {
    @UI.flatten
    @UI.field(ResearchBudget.fundingSources)
    fundingSources: {
      @UI.label("15a. Total Federal Funds Requested")
      federal: ResearchFundingSources.federal;

      @UI.label("15b. Total Non-Federal Funds")
      nonFederal: ResearchFundingSources.nonFederal;

      @UI.label("15c. Total Federal & Non-Federal Funds")
      total: ResearchFundingSources.total;

      @UI.label("15d. Estimated Program Income")
      programIncome: ResearchFundingSources.programIncome;
    };
  };

  @UI.label("16. State Review")
  @UI.field(ResearchCover.application::type.stateReview)
  stateReview: {
    @UI.label("Is Application Subject to Review by State Executive Order 12372 Process?")
    status: ResearchStateReview.status;

    @UI.label("Date")
    date: ResearchStateReview.date;
  };

  /**
   * By signing this application, I certify (1) to the statements contained in the list of certifications* and (2) that the statements herein are true, complete and accurate to the best of my knowledge. I also provide the required assurances* and agree to comply with any resulting terms if I accept an award. I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties. (U.S. Code, Title 18, Section 1001)
   *
   * * The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.
   */
  @UI.label("17. Certification")
  @UI.field(ResearchCover.certification)
  certification: {
    /** Check "I agree" to provide the required certifications and assurances. This field is required. */
    @UI.label("I agree")
    agree: Questions.Certifications.Certification.agree;
  };

  // ===========================================================================
  // ITEMS 18-21: AUTHORIZED REPRESENTATIVE AND ATTACHMENTS
  // ===========================================================================

  @UI.label("18. SF-LLL (Disclosure of Lobbying Activities) or Other Explanatory Documentation")
  @UI.field(ResearchCover.attachments)
  attachments: {
    @UI.label("SF-LLL or Other Explanatory Documentation")
    lobbyingDisclosure: ResearchAttachments.lobbyingDisclosure;
  };

  // Grants.gov signs and dates the certification in the representative's name, so show
  // the signature and date at the end of item 19, where the paper prints them.
  @UI.label("19. Authorized Representative")
  @UI.field(ResearchCover.contacts::type.authorizedRepresentative)
  authorizedRepresentative: {
    @UI.flatten name: ResearchContact.name;
    title: ResearchContact.title;

    @UI.flatten
    @UI.field(ResearchContact.organization)
    organization: {
      name: ResearchPersonOrganization.name;

      @UI.label("Department Name")
      department: ResearchPersonOrganization.department;

      @UI.label("Division Name")
      division: ResearchPersonOrganization.division;
    };

    @UI.flatten address: ResearchContact.address;
    phone: ResearchContact.phone;
    fax: ResearchContact.fax;
    email: ResearchContact.email;

    @UI.label("Signature of Authorized Representative")
    signature: ResearchCover.certification::type.signature;

    dateSigned: ResearchCover.certification::type.dateSigned;
  };

  @UI.label("20. Pre-application")
  preApplication: {
    @UI.label("Pre-application")
    preApplication: ResearchCover.attachments::type.preApplication;
  };

  @UI.label("21. Cover Letter Attachment")
  coverLetter: {
    @UI.label("Cover Letter Attachment")
    coverLetter: ResearchCover.attachments::type.coverLetter;
  };
}
