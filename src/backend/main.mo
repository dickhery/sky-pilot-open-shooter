import List "mo:core/List";
import Map "mo:core/Map";
import Set "mo:core/Set";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import FlightLogsTypes "types/flight-logs";
import LeaderboardTypes "types/leaderboard";
import GameChangeTypes "types/game-change";
import FlightLogsApi "mixins/flight-logs-api";
import FlightPlansApi "mixins/flight-plans-api";
import LeaderboardApi "mixins/leaderboard-api";
import GameChangeApi "mixins/game-change-api";

actor {
  // Stable state — types only, no initializers. Values come from the
  // migration chain in src/backend/migrations/.
  let accessControlState : AccessControl.AccessControlState;
  let flightLogs : List.List<FlightLogsTypes.FlightLog>;
  let nextLogId : { var value : Nat };
  let leaderboard : List.List<LeaderboardTypes.LeaderboardEntry>;
  let nextLeaderboardId : { var value : Nat };
  let gameChangeQueue : List.List<GameChangeTypes.GameChange>;
  let pendingGameChanges : Map.Map<Principal, GameChangeTypes.PendingGameChange>;
  let usedPaymentBlocks : Set.Set<Nat64>;
  let gameChangeCounters : GameChangeTypes.GameChangeCounters;

  include MixinAuthorization(accessControlState, null);
  include FlightLogsApi(flightLogs, nextLogId);
  include FlightPlansApi();
  include LeaderboardApi(leaderboard, nextLeaderboardId);
  include GameChangeApi(gameChangeQueue, pendingGameChanges, usedPaymentBlocks, gameChangeCounters);

  // Reject anonymous writers before Candid decode. Not a security
  // boundary — methods still check the caller. II start/finish stay open.
  system func inspect(
    {
      caller : Principal;
      msg : {
        #recordFlightLog : () -> (
          Int,
          Text,
          FlightLogsTypes.Plane,
          FlightLogsTypes.Weather,
          FlightLogsTypes.ScoreBreakdown,
        );
        #submitLeaderboardScore : () -> (
          Text,
          Text,
          FlightLogsTypes.Plane,
          FlightLogsTypes.Weather,
          Nat,
        );
        #prepareGameChange : () -> (Text, Text);
        #confirmGameChange : () -> Nat64;
        #assignCallerUserRole : () -> (Principal, AccessControl.UserRole);
        #_initialize_access_control : () -> ();
        #_internet_identity_sign_in_start : () -> ();
        #_internet_identity_sign_in_finish : () -> ();
        #listFlightLogs : () -> ();
        #getFlightLog : () -> FlightLogsTypes.LogId;
        #listFlightPlans : () -> ();
        #getFlightPlan : () -> Nat;
        #listPlanes : () -> ();
        #listWeather : () -> ();
        #listLeaderboard : () -> ();
        #getActiveGameFlags : () -> ();
        #listGameChangeQueue : () -> ();
        #getGameChangePaymentInfo : () -> ();
        #getCallerUserRole : () -> ();
        #isCallerAdmin : () -> ();
      };
    }
  ) : Bool {
    switch (msg) {
      case (#recordFlightLog _) { not caller.isAnonymous() };
      case (#submitLeaderboardScore _) { not caller.isAnonymous() };
      case (#prepareGameChange _) { not caller.isAnonymous() };
      case (#confirmGameChange _) { not caller.isAnonymous() };
      case (#assignCallerUserRole _) { not caller.isAnonymous() };
      case (#_initialize_access_control _) { not caller.isAnonymous() };
      case (_) { true };
    };
  };
};
