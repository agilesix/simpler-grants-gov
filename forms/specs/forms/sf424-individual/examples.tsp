import "./form.tsp";

namespace Forms.SF424Individual.Examples;

// Synthetic opportunity and signing values make every source field inspectable. The API,
// not these fixtures, owns actual pre-population and signature/submission dates.
const usCitizen: SF424Individual = #{
  federalAgency: "National Endowment for the Humanities",
  assistanceListingNumber: "45.160",
  assistanceListingTitle: "Fellowships and Stipends",
  fundingOpportunityNumber: "SYNTHETIC-INDIVIDUAL-2026",
  fundingOpportunityTitle: "Synthetic Individual Research Fellowship",
  dateReceived: plainDate.fromISO("2026-11-02"),
  applicant: #{
    name: #{
      prefix: "Dr.",
      firstName: "Alicia",
      middleName: "Marie",
      lastName: "Reyes",
      suffix: "PhD",
    },
    address: #{
      street1: "100 Grant Avenue",
      street2: "Unit 400",
      city: "Baltimore",
      county: "Baltimore City",
      state: Questions.Types.StateCode.MD,
      zipCode: "21218-1234",
      country: Questions.Types.CountryCode.USA,
    },
    phone: "4105550100",
    eveningPhone: "4105550101",
    fax: "4105550199",
    email: "alicia.reyes@example.org",
    citizenship: #{ isUsCitizen: true },
    congressionalDistrict: "MD-007",
  },
  project: #{
    title: "Community Archives Research",
    description: "Study and document community archives using synthetic fellowship data.",
    startDate: plainDate.fromISO("2027-01-01"),
    endDate: plainDate.fromISO("2027-12-31"),
  },
  certification: #{
    agree: true,
    signature: "Alicia Reyes",
    dateSigned: plainDate.fromISO("2026-11-02"),
  },
};

const nonCitizen: SF424Individual = #{
  federalAgency: "National Endowment for the Humanities",
  fundingOpportunityNumber: "SYNTHETIC-INDIVIDUAL-2026",
  fundingOpportunityTitle: "Synthetic Individual Research Fellowship",
  dateReceived: plainDate.fromISO("2026-11-02"),
  applicant: #{
    name: #{ firstName: "Tom", lastName: "Okafor" },
    address: #{
      street1: "456 Rio",
      city: "Montevideo",
      province: "Montevideo",
      country: Questions.Types.CountryCode.URY,
    },
    phone: "1234567890",
    email: "tom.okafor@example.org",
    citizenship: #{
      isUsCitizen: false,
      alienRegistrationNumber: "SYNTHETIC123",
      countryOfCitizenship: Questions.Types.CountryCode.URY,
      residencyStartDate: plainDate.fromISO("2025-01-15"),
    },
    congressionalDistrict: "00-000",
  },
  project: #{
    title: "Community Archives Research",
    description: "Study and document community archives using synthetic fellowship data.",
    startDate: plainDate.fromISO("2027-01-01"),
    endDate: plainDate.fromISO("2027-12-31"),
  },
  certification: #{
    agree: true,
    signature: "Tom Okafor",
    dateSigned: plainDate.fromISO("2026-11-02"),
  },
};
