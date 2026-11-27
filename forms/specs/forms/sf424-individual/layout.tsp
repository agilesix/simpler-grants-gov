import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.SF424Individual;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// One section per numbered paper item, in paper order. Each item's unnumbered title joins
// its section. The first section to show part of a field lays the field out; later
// sections name the rest with `::type`, from the form root.
@UI.layout(SF424Individual)
model SF424IndividualLayout {
  // ===========================================================================
  // ITEMS 1-4: OPPORTUNITY
  // ===========================================================================

  @UI.label("1. Name of Federal Agency")
  @UI.field(SF424Individual.opportunity)
  opportunity: {
    @UI.label("Name of Federal Agency")
    agencyName: SF424IndividualOpportunity.agencyName;
  };

  @UI.label("2. Assistance Listing")
  assistanceListing: {
    @UI.flatten
    assistanceListing: SF424Individual.opportunity::type.assistanceListing;
  };

  @UI.label("3. Date Received")
  @UI.field(SF424Individual.application)
  application: {
    @UI.label("Date Received")
    dateReceived: SF424IndividualApplication.dateReceived;
  };

  @UI.label("4. Funding Opportunity")
  fundingOpportunity: {
    @UI.label("Funding Opportunity Number")
    number: SF424Individual.opportunity::type.number;

    @UI.label("Funding Opportunity Title")
    title: SF424Individual.opportunity::type.title;
  };

  // ===========================================================================
  // ITEM 5: APPLICANT
  // ===========================================================================

  // Show the paper's lettered blocks 5a, 5b and 5c as labeled groups inside item 5. The
  // applicant's own details sit under `contacts.point_of_contact`, so never call them a
  // point of contact on screen.
  @UI.label("5. Applicant Information")
  applicantInformation: {
    @UI.flatten
    @UI.field(SF424Individual.contacts)
    contacts: {
      @UI.flatten
      @UI.field(SF424IndividualContacts.pointOfContact)
      pointOfContact: {
        @UI.label("5a. Name and Contact Information")
        nameAndContact: {
          @UI.flatten name: SF424IndividualPointOfContact.name;

          @UI.label("Telephone Number (Daytime)")
          phone: SF424IndividualPointOfContact.phone;

          @UI.label("Telephone Number (Evening)")
          eveningPhone: SF424IndividualPointOfContact.eveningPhone;

          @UI.label("Email")
          email: SF424IndividualPointOfContact.email;

          @UI.label("Fax Number")
          fax: SF424IndividualPointOfContact.fax;
        };

        @UI.label("5b. Address")
        address: SF424IndividualPointOfContact.address;
      };
    };

    @UI.flatten
    @UI.field(SF424Individual.applicant)
    applicant: {
      @UI.flatten
      @UI.field(SF424IndividualApplicant.person)
      person: {
        /** If No, complete the fields below. */
        @UI.label("5c. Citizenship Status")
        @UI.field(SF424IndividualPerson.citizenship)
        citizenship: {
          @UI.label("U.S. Citizenship")
          isUsCitizen: SF424IndividualCitizenship.isUsCitizen;

          @UI.label("If permanent resident of U.S., enter the Alien Registration #")
          alienRegistrationNumber: SF424IndividualCitizenship.alienRegistrationNumber;

          @UI.label("If foreign national, enter country of citizenship")
          country: SF424IndividualCitizenship.country;

          @UI.label("If foreign national, enter start date of most recent residency in U.S.")
          residencyStartDate: SF424IndividualCitizenship.residencyStartDate;
        };
      };

      @UI.label("5d. Congressional District of Applicant")
      congressionalDistrict: SF424IndividualApplicant.congressionalDistrict;
    };
  };

  // ===========================================================================
  // ITEMS 6-7: PROJECT AND CERTIFICATION
  // ===========================================================================

  @UI.label("6. Project Information")
  @UI.field(SF424Individual.project)
  project: {
    @UI.label("6a. Project Title")
    title: SF424IndividualProject.title;

    @UI.label("6b. Project Description")
    description: SF424IndividualProject.description;

    @UI.label("6c. Proposed Project")
    @UI.field(SF424IndividualProject.timeline)
    timeline: {
      @UI.label("Start Date")
      startDate: SF424IndividualProjectTimeline.startDate;

      @UI.label("End Date")
      endDate: SF424IndividualProjectTimeline.endDate;
    };
  };

  /**
   * By signing this application, I certify (1) to the statements contained in the list of certifications** and (2) that the statements herein are true, complete and accurate to the best of my knowledge. I also provide the required assurances** and agree to comply with any resulting terms if I accept an award. I am aware that any false, fictitious, or fraudulent statements or claims may subject me to criminal, civil, or administrative penalties (U.S. Code, Title 18, Section 1001)
   *
   * ** The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.
   */
  @UI.label("7. Certification")
  @UI.field(SF424Individual.certification)
  certification: {
    @UI.label("I Agree")
    agree: Questions.Certifications.Certification.agree;

    @UI.label("Signature")
    signature: Questions.Certifications.Certification.signature;

    @UI.label("Date Signed")
    dateSigned: Questions.Certifications.Certification.dateSigned;
  };
}
