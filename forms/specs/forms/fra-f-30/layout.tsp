import "simpler-forms";

import "./form.tsp";

using SimplerForms;

namespace Forms.FRAF30;

// =============================================================================
// FORM LAYOUT
// =============================================================================

// The paper form's three parts, then who signs it. Each section quotes the form's text
// exactly, as markdown.
@UI.layout(FRAF30)
model FRAF30Layout {
  /**
   * (1) The grantee certifies to the best of its knowledge and belief, that it and its principles:
   *
   * (a) Are not presently debarred, suspended, proposed for debarment, declared ineligible, or voluntarily excluded by any Federal department or agency;
   *
   * (b) Have not within a three-year period preceding this application been convicted of or had a civil judgment rendered against them for commission of fraud or a criminal offense in connection with obtaining, attempting to obtain, or performing a public (Federal, State or local) transaction or contract under a public transaction; violation of Federal of State antitrust statutes or commission of embezzlement, theft, forgery, bribery, falsification or destruction of records, making false statements, or receiving stolen property;
   *
   * (c) Are not presently indicted for or otherwise criminally or civilly charged by a governmental entity (Federal, State or local) with commission of any of the offenses enumerated in paragraph (1)(b) of this certification; and
   *
   * (d) Have not within a three-year period preceding this application had one or more public transactions (Federal, State or local) terminated for cause or default.
   *
   * (2) Where the grantee is unable to certify to any of the statements of this certification, he or she shall attach an explanation to this application.
   */
  @UI.label("Part A: Certification Regarding Debarment, Suspension and Other Responsibility Matters – Primary Covered Transactions (Pursuant to 2 CFR Part 180)")
  partA: {};

  /**
   * A. The grantee certifies that it will or continue to provide a drug-free workplace by:
   *
   * (a) Publishing a statement notifying employees that the unlawful manufacture, distribution, dispensing, possession, or use of a controlled substance is prohibited in the grantee’s workplace and specifying the actions that will be taken against employees for violation of such prohibition;
   *
   * (b) Establishing an ongoing drug-free awareness program to inform employees about—
   *
   * (1) The dangers of drug abuse in the workplace;
   *
   * (2) The grantee’s policy of maintaining a drug-free workplace;
   *
   * (3) Any available drug counseling, rehabilitation, and employee assistance programs; and
   *
   * (4) The penalties that may be imposed upon employees for drug abuse violations occurring in the workplace;
   *
   * (c) Making it a requirement that each employee to be engaged in the performance of the grant be given a copy of the statement required by paragraph (a);
   *
   * (d) Notifying the employee in the statement required by paragraph (a) that, as a condition of employment under the grant, the employee will—
   *
   * (1) Abide by the terms of the statement; and
   *
   * (2) Notify the employer in writing of his or her conviction for a violation of criminal drug statute occurring in the workplace no later than five calendar days after such conviction;
   *
   * (e) Notifying the agency in writing, within ten calendar days after receiving notice under subparagraph (d)(2) from an employee or otherwise receiving actual notice of such conviction. Employers of convicted employees must provide notice, including position title, to every grant officer on whose grant activity the convicted employee was working, unless the Federal agency has designated a central point for the receipt of such notices. Notice shall include the identification number(s) of each affected grant;
   *
   * (f) Taking one of the following actions, within 30 calendar days of receiving notice under subparagraph (d)(2), with respect to any employee is so convicted—
   *
   * (1) Taking appropriate personnel action against such an employee, up to and including termination, consistent with the requirements of the Rehabilitation Act of 1973, as amended; or
   *
   * (2) Requiring such employee to participate satisfactorily in a drug abuse assistance or rehabilitation program approved for such purposes by a Federal, State, or local health, law enforcement, or other appropriate agency;
   *
   * (g) Making a good faith effort to continue to maintain a drug-free workplace through implementation of paragraphs (a), (b), (c), (e) and (f).
   *
   * B. The grantee may insert in the space below the site(s) for the performance of work done in connection with the specific grant:
   */
  @UI.label("Part B: Certification Regarding Drug-Free Workplace Requirements (Pursuant to 49 CFR Part 32)")
  partB: {
    placesOfPerformance: FRAF30.placesOfPerformance;
    workplacesNotIdentified: FRAF30.workplacesNotIdentified;
  };

  /**
   * The undersigned certifies, to the best of his or her knowledge and belief, that:
   *
   * (1) No Federal appropriated funds have been paid or will be paid, by or on behalf of the undersigned, to any person for influencing or attempting to influence an officer or employee of an agency, a Member of Congress, an officer or employee of Congress, or an employee of a Member of Congress in connection with the awarding of any Federal contract, the making of any Federal grant, the making of any Federal loan, the entering into of any cooperative agreement, and the extension, continuation, renewal, amendment, or modification of any Federal contract, grant, loan, or cooperative agreement.
   *
   * (2) If any funds other than Federal appropriated funds have been paid or will be paid to any person for influencing or attempting to influence an officer or employee of any agency, a Member of Congress, an officer or employee of Congress, or an employee of a Member of Congress in connection with this Federal contract, grant, loan, or cooperative agreement, the undersigned shall complete and submit Standard Form-LLL, “Disclosure Form to Report Lobbying,” in accordance with its instructions.
   *
   * (3) The undersigned shall require that the language of this certification be included in the award document for all subawards at all tiers (including subcontracts, subgrants, and contracts under grants, loans, and cooperative agreements) and that all subrecipients shall certify accordingly.
   *
   * This certification is a material representation of fact upon which reliance was placed when this transaction was made or entered into. Submission of this certification is a prerequisite for making or entering into this transaction imposed by 31 USC 1352. Any person who fails to file the required certification shall be subject to a civil penalty of not less than $10,000 and not more than $100,000 for each such failure.
   */
  @UI.label("Part C: Certification Regarding Lobbying (Pursuant to 49 CFR Part 20)")
  partC: {
    exceedsLobbyingThreshold: FRAF30.exceedsLobbyingThreshold;
  };

  /**
   * As the authorized certifying official, I hereby certify that the certifications in Parts A, B, and C (if C is applicable) are true.
   */
  @UI.label("Authorized Certifying Official")
  official: {
    signature: FRAF30.signature;
    nameAndTitle: FRAF30.nameAndTitle;
    dateSigned: FRAF30.dateSigned;
  };

  /**
   * Public reporting burden for this information collection is estimated to average 0.25 hours per response, including time for reviewing instructions, searching existing data sources, gathering and maintaining the data needed, and completing and reviewing the collection of information. According to the Paperwork Reduction Act of 1995, a federal agency may not conduct or sponsor, and a person is not required to respond to a collection of information unless it displays a currently valid OMB Control Number. The valid OMB control number for this information collection is 2130-0615. All responses to this collection of information are mandatory. Send comments regarding this burden estimate or any other aspect of this collection, including suggestions for reducing this burden, to: Information Collection Officer, Federal Railroad Administration, 1200 New Jersey Ave., NW, Washington, DC 20590.
   */
  @UI.label("Paperwork Burden Statement")
  burden: {};
}
