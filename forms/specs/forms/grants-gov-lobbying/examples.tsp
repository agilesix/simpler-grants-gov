import "./form.tsp";

namespace Forms.GrantsGovLobbying.Examples;

/** A complete form. Grants.gov fills in the signature and date. */
const form: GrantsGovLobbying = #{
  organizationName: "Harbor Research Institute",
  authorizedRepresentativeName: #{
    prefix: "Dr.",
    firstName: "Morgan",
    middleName: "Quinn",
    lastName: "Lake",
  },
  authorizedRepresentativeTitle: "Executive Director",
};
