import Types "../types/flight-plans";

module {
  public type FlightPlan = Types.FlightPlan;
  public type PlanId = Types.PlanId;
  public type Plane = Types.Plane;
  public type Weather = Types.Weather;

  /// Strike jet. Catalog id 1 — stored logs still use the #cessna variant.
  public let viper : Plane = {
    id = 1;
    name = "F-27 Viper";
    handling = "Supersonic strike jet — fast attack runs, land at a FOB to take a hovercraft.";
  };

  /// Attack helicopter. Catalog id 2 — stored logs still use the #gulfstream variant.
  public let spectre : Plane = {
    id = 2;
    name = "AH-9 Spectre";
    handling = "Attack helicopter — hover, land off-strip, dismount, and clear on foot.";
  };

  /// The two selectable airframes with distinct combat roles.
  public let planes : [Plane] = [viper, spectre];

  /// The three supported weather conditions.
  public let weather : [Weather] = [
    #daytime,
    #nighttime,
    #partlyCloudy,
  ];

  /// Mission catalog. Each plan is a bounded theater: drop in, clear
  /// sectors for a multiplier, then extract. Query-only — no canister
  /// writes, so listing missions stays cheap on cycles.
  public let plans : [FlightPlan] = [
    {
      id = 1;
      name = "Coastal Sweep";
      weather = #daytime;
      plane = viper;
      departure = { name = "FOB Tide"; description = "Sea-level strip. Drop in, then strike coastal batteries." };
      waypoint = { name = "Lighthouse Battery"; description = "First sector — clear the gun nests on the point." };
      landing = { name = "LZ Marsh"; description = "Extract strip inland. Or push the next ridge for a multiplier." };
      routeDescription = "Daylight jet raid. Flatten the coastal outposts, then extract or push inland for bonus sectors.";
    },
    {
      id = 2;
      name = "Ridge Hammer";
      weather = #daytime;
      plane = spectre;
      departure = { name = "FOB Granite"; description = "Short mountain pad with shifting crosswinds." };
      waypoint = { name = "Ridge Pass Camp"; description = "Hover the pass and put troops on the ridge." };
      landing = { name = "LZ Plateau"; description = "High extract pad. Clear the valley camp first for a multiplier." };
      routeDescription = "Helicopter assault on the ridge. Land, dismount, and clear the pass before extracting.";
    },
    {
      id = 3;
      name = "Harbor Raid";
      weather = #nighttime;
      plane = viper;
      departure = { name = "FOB Nightfall"; description = "Lit night strip on the harbor rim." };
      waypoint = { name = "Beacon Wharf"; description = "Night sector — hit the docks and the radar hut." };
      landing = { name = "LZ Quay"; description = "Harbor extract. A hovercraft run finishes closer targets." };
      routeDescription = "Night jet strike on the harbor. Strafe the wharf, then extract or take the hovercraft in.";
    },
    {
      id = 4;
      name = "Night Stalker";
      weather = #nighttime;
      plane = spectre;
      departure = { name = "FOB Neon"; description = "Downtown pad, skyline glow on lift-off." };
      waypoint = { name = "Tower District"; description = "Urban outpost under the illuminated tower." };
      landing = { name = "LZ Uptown"; description = "Extract between the blocks after the rooftop sweep." };
      routeDescription = "Night helicopter sweep through the city. Hover the tower block, dismount, and extract uptown.";
    },
    {
      id = 5;
      name = "Valley Sweep";
      weather = #partlyCloudy;
      plane = viper;
      departure = { name = "FOB Hollow"; description = "Valley-floor strip under broken cloud." };
      waypoint = { name = "Cloud Gap Camp"; description = "First sector in the gap — radar and bunkers." };
      landing = { name = "LZ Overlook"; description = "Far-valley extract. Push the river camp for a multiplier." };
      routeDescription = "Jet run down the valley. Clear the gap, then extract at the overlook or keep hunting.";
    },
    {
      id = 6;
      name = "Storm Front";
      weather = #partlyCloudy;
      plane = spectre;
      departure = { name = "FOB Gale"; description = "Coastal pad with building cloud cover offshore." };
      waypoint = { name = "Buoy Battery"; description = "Offshore guns and a weather radar shack." };
      landing = { name = "LZ Spit"; description = "Beat the weather back to the coastal extract." };
      routeDescription = "Helicopter raid ahead of the front. Hover the buoy guns, then extract before the storm closes.";
    },
  ];

  /// List all available missions (the level-select grid).
  public func listPlans() : [FlightPlan] {
    plans;
  };

  /// Look up a single mission by id.
  public func getPlan(planId : PlanId) : ?FlightPlan {
    plans.find(func(p) { p.id == planId });
  };

  /// Return the two selectable airframes.
  public func listPlanes() : [Plane] {
    planes;
  };

  /// Return the three supported weather conditions.
  public func listWeather() : [Weather] {
    weather;
  };
};
