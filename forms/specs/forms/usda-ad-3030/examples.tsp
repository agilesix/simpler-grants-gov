import "./form.tsp";

namespace Forms.AD3030.Examples;

/** A corporation with no felony conviction and no unpaid Federal tax liability. */
const noToBoth: AD3030 = #{
  applicantName: "Prairie Grain Cooperative, Inc.",
  applicantAddress: "100 Market Street, Ames, IA 50010",
  taxIdNumber: "0123",
  applicantFelony: false,
  unpaidFederalTax: false,
  title: "President",
};

/** A corporation that answers Yes to both questions. */
const yesToBoth: AD3030 = #{
  applicantName: "Riverbend Foods Corporation",
  applicantAddress: "42 River Road, Suite 300, Omaha, NE 68102",
  taxIdNumber: "9876",
  applicantFelony: true,
  unpaidFederalTax: true,
  title: "Chief Financial Officer",
};
