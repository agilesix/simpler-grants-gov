import "./form.tsp";

namespace Forms.AD1047.Examples;

/** A complete form. Grants.gov fills in the signature and date. */
const form: AD1047 = #{
  organizationName: "Lakeside State University",
  projectName: "Rural Broadband Feasibility Study",
  authorizedRepresentative: #{
    prefix: "Dr.",
    firstName: "Renee",
    lastName: "Alvarez",
  },
  title: "Director, Sponsored Programs",
};
