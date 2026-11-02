import "form-library-xml";
import "simpler-forms";
import "simpler-forms-sgg";
import "#forms/index.tsp";
import "#questions/application/index.tsp";
import "./fragments.tsp";
import "./examples.tsp";

using SimplerForms;

namespace Forms.SF424Individual;

/** Application for Federal Domestic Assistance — Individual, Grants.gov version2.0. */
@Meta.form(#{
  id: "sf424-individual",
  formName: "Application for Federal Domestic Assistance - Individual",
})
@Sgg.sync(#{ xml: "mapping" })
@GrantsGov.form(#{
  legacyFormId: 668,
  shortFormName: "SF424_Individual",
  formVersion: "2.0",
  agencyCode: "SGG",
  ombNumber: "4040-0005",
  expirationDate: "2029-01-31",
})
@example(Examples.nonCitizen)
@example(Examples.usCitizen)
model SF424Individual {
  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.prePopulate(Sgg.PrePopulationRule.agencyName)
  federalAgency: Questions.Applications.AgencyName;

  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.prePopulate(Sgg.PrePopulationRule.assistanceListingNumber)
  assistanceListingNumber?: Questions.Applications.AssistanceListingNumber;

  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.prePopulate(Sgg.PrePopulationRule.assistanceListingTitle)
  assistanceListingTitle?: Questions.Applications.AssistanceListingTitle;

  /** Completed by Grants.gov upon submission. */
  @UI.label("Date Received")
  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  dateReceived?: plainDate;

  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.prePopulate(Sgg.PrePopulationRule.opportunityNumber)
  fundingOpportunityNumber: Questions.Applications.OpportunityNumber;

  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.prePopulate(Sgg.PrePopulationRule.opportunityTitle)
  fundingOpportunityTitle: Questions.Applications.OpportunityTitle;

  @UI.label("Applicant Information")
  applicant: Applicant;

  @UI.label("Project Information")
  project: Project;

  @UI.label("Certification")
  certification: Certification;
}
