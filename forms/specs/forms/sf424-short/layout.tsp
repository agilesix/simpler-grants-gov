import "simpler-forms";

import "#questions/certification/index.tsp";

import "./form.tsp";

using SimplerForms;

namespace Forms.SF424Short;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// One section per numbered paper item, in DAT order. Each item's unnumbered title joins
// its section. The first section to show part of a field lays the field out; later
// sections name the rest with `::type`, from the form root.
@UI.layout(SF424Short)
model SF424ShortLayout {
  // ===========================================================================
  // ITEMS 1-4: OPPORTUNITY
  // ===========================================================================

  @UI.label("1. Name of Federal Agency")
  @UI.field(SF424Short.opportunity)
  opportunity: {
    @UI.label("Name of Federal Agency")
    agencyName: ShortOpportunity.agencyName;
  };

  @UI.label("2. Assistance Listing")
  assistanceListing: {
    @UI.flatten
    assistanceListing: SF424Short.opportunity::type.assistanceListing;
  };

  @UI.label("3. Date Received")
  @UI.field(SF424Short.application)
  application: {
    @UI.label("Date Received")
    dateReceived: ShortApplication.dateReceived;
  };

  @UI.label("4. Funding Opportunity")
  fundingOpportunity: {
    @UI.label("Funding Opportunity Number")
    number: SF424Short.opportunity::type.number;

    @UI.label("Funding Opportunity Title")
    title: SF424Short.opportunity::type.title;
  };

  // ===========================================================================
  // ITEMS 5-6: APPLICANT AND PROJECT
  // ===========================================================================

  // Show the paper's lettered block 5b as a labeled group inside item 5.
  @UI.label("5. Applicant Information")
  @UI.field(SF424Short.applicant)
  applicant: {
    @UI.label("5a. Legal Name")
    name: ShortApplicant.organization::type.name;

    @UI.label("5b. Address")
    address: ShortApplicant.organization::type.address;

    @UI.label("5c. Web Address")
    webAddress: ShortApplicant.organization::type.webAddress;

    @UI.label("5d. Type of Applicant")
    codes: ShortApplicant.type::type.codes;

    @UI.label("Other (specify)")
    otherSpecify: ShortApplicant.type::type.otherSpecify;

    @UI.label("5e. Employer/Taxpayer Identification Number (EIN/TIN)")
    ein: ShortApplicant.organization::type.ein;

    @UI.label("5f. UEI")
    uei: ShortApplicant.organization::type.uei;

    @UI.label("5g. Congressional District of Applicant")
    congressionalDistrict: ShortApplicant.congressionalDistrict;
  };

  @UI.label("6. Project Information")
  @UI.field(SF424Short.project)
  project: {
    @UI.label("6a. Project Title")
    title: ShortProject.title;

    @UI.label("6b. Project Description")
    description: ShortProject.description;

    @UI.label("6c. Proposed Project")
    @UI.field(ShortProject.timeline)
    timeline: {
      @UI.label("Start Date")
      startDate: ShortProjectTimeline.startDate;

      @UI.label("End Date")
      endDate: ShortProjectTimeline.endDate;
    };
  };

  // ===========================================================================
  // ITEMS 7-8: CONTACTS
  // ===========================================================================

  // Ask for each person's address after their email, phone and fax, as the DAT does.
  @UI.label("7. Project Director")
  @UI.field(SF424Short.contacts)
  contacts: {
    @UI.flatten
    @UI.field(ShortContacts.projectDirector)
    projectDirector: {
      @UI.flatten name: ShortContact.name;
      title: ShortContact.title;
      email: ShortContact.email;
      phone: ShortContact.phone;
      fax: ShortContact.fax;
      @UI.flatten address: ShortContact.address;
    };
  };

  @UI.label("8. Primary Contact/Grants Administrator")
  @UI.field(SF424Short.contacts::type.pointOfContact)
  pointOfContact: {
    /** If checked, enter the Project Director's details from item 7 again here. */
    @UI.label("Same as Project Director")
    sameAsProjectDirector: ShortPointOfContact.sameAsProjectDirector;

    @UI.flatten name: ShortPointOfContact.name;
    title: ShortPointOfContact.title;
    email: ShortPointOfContact.email;
    phone: ShortPointOfContact.phone;
    fax: ShortPointOfContact.fax;
    @UI.flatten address: ShortPointOfContact.address;
  };

  // ===========================================================================
  // ITEM 9: AUTHORIZED REPRESENTATIVE
  // ===========================================================================

  /**
   * * By signing this application, I certify (1) to the statements contained in the list of certifications** and (2) that the statements herein are true, complete and accurate to the best of my knowledge.  I also provide the required assurances** and agree to comply with any resulting terms if I accept an award.  I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties (U.S. Code, Title 18, Section 1001)
   *
   * ** The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.
   */
  @UI.label("9. Authorized Representative")
  @UI.field(SF424Short.certification)
  certification: {
    agree: Questions.Certifications.Certification.agree;

    // Grants.gov signs and dates the certification in the representative's name, so show
    // the signature and date after the representative's details.
    @UI.flatten
    @UI.field(SF424Short.contacts::type.authorizedRepresentative)
    authorizedRepresentative: {
      @UI.flatten name: ShortRepresentative.name;
      title: ShortRepresentative.title;
      email: ShortRepresentative.email;
      phone: ShortRepresentative.phone;
      fax: ShortRepresentative.fax;
    };

    @UI.label("Signature of Authorized Representative")
    signature: Questions.Certifications.Certification.signature;

    dateSigned: Questions.Certifications.Certification.dateSigned;
  };
}
