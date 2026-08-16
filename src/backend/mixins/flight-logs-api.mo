import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/flight-logs";
import FlightLogs "../lib/flight-logs";

mixin (
  logs : List.List<Types.FlightLog>,
  nextLogId : { var value : Nat },
) {
  /// Sliding window so a signed-in caller cannot flood updates.
  transient var logWriteWindowStart : Int = 0;
  transient var logWriteWindowCount : Nat = 0;
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
    throttleLogWrites();
    FlightLogs.addLog(logs, nextLogId, caller, completedAt, planName, plane, weather, score);
  };

  func throttleLogWrites() {
    let now = Time.now();
    let windowNs : Int = 60_000_000_000;
    if (now - logWriteWindowStart > windowNs) {
      logWriteWindowStart := now;
      logWriteWindowCount := 0;
    };
    if (logWriteWindowCount >= 20) {
      Runtime.trap("too many writes — try again in a minute");
    };
    logWriteWindowCount += 1;
  };
};
