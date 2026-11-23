import "./form.tsp";

namespace Forms.CD511.Examples;

/** An award number, without a project name. */
const awardNumber: CD511 = #{
  applicantName: "Coastal Fisheries Institute",
  awardNumber: "NA26NOS4200123",
  contactPerson: #{ firstName: "Jonah", lastName: "Reed" },
  contactPersonTitle: "Certifying Official",
};

/** A project name, without an award number. */
const projectName: CD511 = #{
  applicantName: "Coastal Fisheries Institute",
  projectName: "Estuary Habitat Restoration",
  contactPerson: #{
    prefix: "Ms.",
    firstName: "Avery",
    middleName: "Rae",
    lastName: "Pine",
  },
  contactPersonTitle: "Executive Director",
};
