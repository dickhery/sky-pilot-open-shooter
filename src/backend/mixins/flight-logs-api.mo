import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Types "../types/flight-logs";
import FlightLogs "../lib/flight-logs";

mixin (
  logs : List.List<Types.FlightLog>,
  nextLogId : { var value : Nat },
) {
  /// List the caller's past missions, newest first.
  public shared query ({ caller }) func listFlightLogs() : async [Types.FlightLogView] {
    FlightLogs.listForPlayer(logs, caller);
  };

  /// Get a single mission log by id, scoped to the caller.
  public shared query ({ caller }) func getFlightLog(logId : Types.LogId) : async ?Types.FlightLogView {
    FlightLogs.getForPlayer(logs, caller, logId);
  };

  /// Persist a completed mission score. Combat itself never touches the
  /// canister — one update at extract keeps cycle use bounded.
  public shared ({ caller }) func recordFlightLog(
    completedAt : Int,
    planName : Text,
    plane : Types.Plane,
    weather : Types.Weather,
    score : Types.ScoreBreakdown,
  ) : async Types.FlightLogView {
    if (caller.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to save a log");
    };
    FlightLogs.addLog(logs, nextLogId, caller, completedAt, planName, plane, weather, score);
  };
};
