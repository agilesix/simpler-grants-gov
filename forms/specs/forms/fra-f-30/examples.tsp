import "./form.tsp";

namespace Forms.FRAF30.Examples;

/** Two places of performance, under the lobbying threshold. */
const twoPlaces: FRAF30 = #{
  placesOfPerformance: #[
    "1200 Union Station Way, Denver, Denver County, CO 80202",
    "45 Rail Yard Road, Pueblo, Pueblo County, CO 81003"
  ],
  workplacesNotIdentified: true,
  exceedsLobbyingThreshold: false,
  nameAndTitle: "Morgan Patel, Executive Director",
};

/** No places of performance, over the lobbying threshold. */
const noPlaces: FRAF30 = #{
  exceedsLobbyingThreshold: true,
  nameAndTitle: "Jordan Lee, Chief Financial Officer",
};
