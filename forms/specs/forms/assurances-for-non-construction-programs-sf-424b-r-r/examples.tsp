import "./form.tsp";

namespace Forms.SF424BRR.Examples;

const sample1: SF424BRR = #{
  authorizedRepresentative: #{
    signature: "Jordan Lee",
    title: "Executive Director",
  },
  applicantOrganizationName: "Example Research Institute",
  submittedDate: plainDate.fromISO("2026-10-24"),
};

const sample2: SF424BRR = #{
  authorizedRepresentative: #{
    signature: "Morgan Patel",
    title: "Authorized Certifying Official",
  },
  applicantOrganizationName: "Example Community Organization",
  submittedDate: plainDate.fromISO("2026-10-25"),
};
