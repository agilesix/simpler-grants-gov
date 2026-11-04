import "./form.tsp";

namespace Forms.USDAAD3030.Examples;

const sample1: Representations = #{
  applicant: #{
    name: "Example Research Corporation",
    address: "123 Example Street, Washington, DC 20001",
    taxIdNumber: "0012",
    felonyConviction: YesNo.no,
    unpaidFederalTax: YesNo.no,
  },
  certification: #{
    signature: "Jordan Lee",
    title: "President",
    dateSigned: Questions.Certifications.DateSigned.fromISO("2026-11-04"),
  },
};

const sample2: Representations = #{
  applicant: #{
    name: "Second Example Corporation",
    address: "456 Sample Avenue, Arlington, VA 22201",
    taxIdNumber: "9876",
    felonyConviction: YesNo.yes,
    unpaidFederalTax: YesNo.yes,
  },
  certification: #{
    signature: "Morgan Patel",
    title: "Authorized Representative",
    dateSigned: Questions.Certifications.DateSigned.fromISO("2026-11-05"),
  },
};
