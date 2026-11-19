import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.CD511;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// The sections of SGG's existing form. The first four quote the certification exactly, as
// markdown, in the PDF's order.
@UI.layout(CD511)
model CD511Layout {
  /**
   * Applicants should also review the instructions for certification included in the regulations before completing this form. Signature on this form provides for compliance with certification requirements under 15 CFR Part 28, 'New Restrictions on Lobbying.' The certifications shall be treated as a material representation of fact upon which reliance will be placed when the Department of Commerce determines to award the covered transaction, grant, or cooperative agreement.
   */
  @UI.label("Certification Regarding Lobbying")
  certification: {};

  /**
   * As required by Section 1352, Title 31 of the U.S. Code, and implemented at 15 CFR Part 28, for persons entering into a grant, cooperative agreement or contract over $100,000 or a loan or loan guarantee over $150,000 as defined at 15 CFR Part 28, Sections 28.105 and 28.110, the applicant certifies that to the best of his or her knowledge and belief, that:
   *
   * (1) No Federal appropriated funds have been paid or will be paid, by or on behalf of the undersigned, to any person for influencing or attempting to influence an officer or employee of any agency, a Member of Congress in connection with the awarding of any Federal contract, the making of any Federal grant, the making of any Federal loan, the entering into of any cooperative agreement, and the extension, continuation, renewal, amendment, or modification of any Federal contract, grant, loan, or cooperative agreement.
   *
   * (2) If any funds other than Federal appropriated funds have been paid or will be paid to any person for influencing or attempting to influence an officer or employee of any agency, a Member of Congress, an officer or employee of Congress, or an employee of a member of Congress in connection with this Federal contract, grant, loan, or cooperative agreement, the undersigned shall complete and submit Standard Form-LLL, 'Disclosure Form to Report Lobbying.' in accordance with its instructions.
   *
   * (3) The undersigned shall require that the language of this certification be included in the award documents for all subawards at all tiers (including subcontracts, subgrants, and contracts under grants, loans, and cooperative agreements) and that all subrecipients shall certify and disclose accordingly.
   *
   * This certification is a material representation of fact upon which reliance was placed when this transaction was made or entered into. Submission of this certification is a prerequisite for making or entering into this transaction imposed by section 1352, title 31, U.S. Code. Any person who fails to file the required certification shall be subject to a civil penalty of not less than $10,000 and not more than $100,000 for each such failure occurring on or before October 23, 1996, and of not less than $11,000 and not more than $110,000 for each such failure occurring after October 23, 1996.
   */
  @UI.label("Lobbying")
  lobbying: {};

  /**
   * The undersigned states, to the best of his or her knowledge and belief, that:
   *
   * In any funds have been paid or will be paid to any person for influencing or attempting to influence an officer or employee of any agency, a Member of Congress, an officer or employee of Congress, or an employee of a Member of Congress in connection with this commitment providing for the United States to insure or guarantee a loan, the undersigned shall complete and submit Standard Form-LLL, 'Disclosure Form to Report Lobbying,' in accordance with its instructions.
   *
   * Submission of this statement is a prerequisite for making or entering into this transaction imposed by section 1352, title 31, U.S. Code. Any person who fails to file the required statement shall be subject to a civil penalty of not less than $10,000 and not more than $100,000 for each such failure occurring on or before October 23, 1996, and of not less than $11,000 and not more than $110,000 for each such failure occurring after October 23, 1996.
   */
  @UI.label("Statement for Loan Guarantees and Loan Insurance")
  loans: {};

  /**
   * As the duly authorized representative of the applicant, I hereby certify that the applicant will comply with the above applicable certification.
   */
  @UI.label("Acknowledgement")
  acknowledgement: {};

  @UI.label("1. Applicant Information")
  award: {
    applicantName: CD511.applicantName;
    awardNumber: CD511.awardNumber;
    projectName: CD511.projectName;
  };

  @UI.label("2. Contact Person")
  contactPerson: {
    @UI.flatten contactPerson: CD511.contactPerson;
    contactPersonTitle: CD511.contactPersonTitle;
  };

  @UI.label("3. Signature")
  signature: {
    signature: CD511.signature;
    submittedDate: CD511.submittedDate;
  };
}
