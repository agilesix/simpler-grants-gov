import "simpler-forms";
import "simpler-forms-sgg";
import "#forms/index.tsp";
import "#questions/application/index.tsp";
import "#questions/person/index.tsp";

using SimplerForms;

namespace Forms.SF424Individual;

model Applicant {
  name: Questions.People.PersonName;
  address: Questions.People.PersonAddress;
  phone: Questions.People.PersonPhoneNumber;

  /** Enter the evening telephone number. */
  @UI.label("Telephone Number (Evening)")
  eveningPhone?: Questions.People.PersonPhoneNumber;

  fax?: Questions.People.PersonFaxNumber;
  email: Questions.People.PersonEmail;

  @UI.label("Citizenship Status")
  citizenship: Citizenship;

  congressionalDistrict: Questions.Applications.ApplicantCongressionalDistrict;
}

// The DAT explicitly requires country/date for No, while its labels refer to foreign
// nationals. Preserve that source conflict in the plan/comparison; do not invent a third status.
model Citizenship {
  @UI.label("U.S. Citizenship")
  @UI.widget(Rendering.Widget.Radio)
  isUsCitizen: boolean;

  /** Enter the Alien Registration Number. */
  @UI.label("If permanent resident of U.S., enter the Alien Registration #")
  @UI.enabledWhen(Citizenship.isUsCitizen, false)
  @minLength(1)
  @maxLength(14)
  alienRegistrationNumber?: string;

  /** Select the country. This field is required if the applicant is not a U.S. citizen. */
  @UI.label("If foreign national, enter country of citizenship")
  @UI.enabledWhen(Citizenship.isUsCitizen, false)
  @Validation.requiredWhen(Citizenship.isUsCitizen, false)
  countryOfCitizenship?: Questions.Types.CountryCode;

  /** Enter the start date of the most recent residency in the U.S. This field is required if the applicant is not a U.S. citizen. */
  @UI.label("If foreign national, enter start date of most recent residency in U.S.")
  @UI.enabledWhen(Citizenship.isUsCitizen, false)
  @Validation.requiredWhen(Citizenship.isUsCitizen, false)
  residencyStartDate?: plainDate;
}

model Project {
  title: Questions.Applications.ProjectTitle;

  /** Enter a brief description of the project. */
  @UI.label("Project Description")
  @UI.widget(Rendering.Widget.TextArea)
  @minLength(1)
  @maxLength(1000)
  description: string;

  /** Enter the start date for the proposed project. */
  @UI.label("Start Date")
  startDate: plainDate;

  /** Enter the end date for the proposed project. The end date cannot be earlier than the start date. */
  @UI.label("End Date")
  @Validation.notBefore(Project.startDate)
  endDate: plainDate;
}

model Certification {
  /** The list of certifications and assurances, or an internet site where you may obtain this list, is contained in the announcement or agency specific instructions. */
  @UI.label("I Agree")
  @UI.widget(Rendering.Widget.Checkbox)
  agree: true;

  /** Completed by Grants.gov upon submission. */
  @UI.label("Signature")
  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.postPopulate(Sgg.PostPopulationRule.signature)
  @minLength(1)
  @maxLength(144)
  signature?: string;

  /** Completed by Grants.gov upon submission. */
  @UI.label("Date Signed")
  @UI.readOnly
  @Meta.role(ResponseRole.systemValue)
  @Sgg.postPopulate(Sgg.PostPopulationRule.currentDate)
  dateSigned?: plainDate;
}
