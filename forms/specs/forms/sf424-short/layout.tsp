import "simpler-forms";
import "./form.tsp";
using SimplerForms;
namespace Forms.SF424Short;

@UI.layout(SF424Short)
model SF424ShortLayout {
  @UI.label("Opportunity information")
  @doc("Review the opportunity values supplied by the application. Examples supply synthetic context; this preview does not connect to an application or populate real opportunity data.")
  opportunity: {
    agencyName: SF424Short.agencyName;
    assistanceListingNumber: SF424Short.assistanceListingNumber;
    assistanceListingProgramTitle: SF424Short.assistanceListingProgramTitle;
    dateReceived: SF424Short.dateReceived;
    fundingOpportunityNumber: SF424Short.fundingOpportunityNumber;
    fundingOpportunityTitle: SF424Short.fundingOpportunityTitle;
  };

  @UI.label("Applicant organization")
  applicant: {
    organizationName: SF424Short.organizationName;
    applicant: SF424Short.applicant;
    applicantWebAddress: SF424Short.applicantWebAddress;
    applicantTypeCode: SF424Short.applicantTypeCode;
    applicantTypeOtherSpecify: SF424Short.applicantTypeOtherSpecify;
    employerTaxpayerIdentificationNumber: SF424Short.employerTaxpayerIdentificationNumber;
    samUei: SF424Short.samUei;
    congressionalDistrictApplicant: SF424Short.congressionalDistrictApplicant;
  };

  @UI.label("Project information")
  project: {
    projectTitle: SF424Short.projectTitle;
    projectDescription: SF424Short.projectDescription;
    projectStartDate: SF424Short.projectStartDate;
    projectEndDate: SF424Short.projectEndDate;
  };

  @UI.label("Project Director")
  director: {
    @UI.flatten
    projectDirector: SF424Short.projectDirector;
  };

  @UI.label("Primary Contact / Grants Administrator")
  @doc("Enter the primary contact or grants administrator. Complete this section even when the person is also the project director.")
  contact: {
    sameAsProjectDirector: SF424Short.sameAsProjectDirector;

    @UI.flatten
    contactPerson: SF424Short.contactPerson;
  };

  @UI.label("Authorized Representative")
  @doc("9. * By signing this application, I certify (1) to the statements contained in the list of certifications** and (2) that the statements herein are true, complete and accurate to the best of my knowledge.  I also provide the required assurances** and agree to comply with any resulting terms if I accept an award.  I am aware that any false, fictitious, or fradulent statements or claims may subject me to criminal, civil, or administrative penalties (U.S. Code, Title 18, Section 1001)\n\n** The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions.")
  representative: {
    applicationCertification: SF424Short.applicationCertification;

    @UI.flatten
    authorizedRepresentative: SF424Short.authorizedRepresentative;

    authorizedRepresentativeTitle: SF424Short.authorizedRepresentativeTitle;
    authorizedRepresentativeEmail: SF424Short.authorizedRepresentativeEmail;
    authorizedRepresentativePhoneNumber: SF424Short.authorizedRepresentativePhoneNumber;
    authorizedRepresentativeFax: SF424Short.authorizedRepresentativeFax;
    aorSignature: SF424Short.aorSignature;
    authorizedRepresentativeDateSigned: SF424Short.authorizedRepresentativeDateSigned;
  };
}
