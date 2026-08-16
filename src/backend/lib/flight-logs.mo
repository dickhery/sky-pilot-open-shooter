import FlightPlans "flight-plans";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Types "../types/flight-logs";

module {
  public type FlightLog = Types.FlightLog;
  public type FlightLogView = Types.FlightLogView;
  public type LogId = Types.LogId;
  public type PlayerId = Types.PlayerId;
  public type ScoreBreakdown = Types.ScoreBreakdown;

  /// Hard cap so one principal cannot grow the canister without bound.
  public let maxLogsPerPlayer : Nat = 20;
  public let maxPlanNameChars : Nat = 48;

  /// List all flight logs belonging to the given player, newest first.
  public func listForPlayer(
    logs : List.List<FlightLog>,
    playerId : PlayerId,
  ) : [FlightLogView] {
    let owned = logs.filter(func(log) { Principal.equal(log.playerId, playerId) });
    owned.reverse().toArray();
  };

  /// Get a single flight log by id, scoped to the given player.
  public func getForPlayer(
    logs : List.List<FlightLog>,
    playerId : PlayerId,
    logId : LogId,
  ) : ?FlightLogView {
    logs.find(func(log) { log.id == logId and Principal.equal(log.playerId, playerId) });
  };

  /// Append a completed mission score. Rejects anonymous callers (the
  /// anonymous principal would otherwise be a shared identity) and drops
  /// the oldest row when the per-player cap is hit.
  public func addLog(
    logs : List.List<FlightLog>,
    nextId : { var value : Nat },
    playerId : PlayerId,
    completedAt : Int,
    planName : Text,
    plane : Types.Plane,
    weather : Types.Weather,
    score : ScoreBreakdown,
  ) : FlightLogView {
    if (playerId.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to save a log");
    };
    if (planName.size() == 0 or planName.size() > maxPlanNameChars) {
      Runtime.trap("mission name is invalid");
    };
    if (FlightPlans.plans.find(func(p : FlightPlans.FlightPlan) : Bool { p.name == planName }) == null) {
      Runtime.trap("unknown mission");
    };
    if (score.total > 100 or score.speed > 100 or score.landingSmoothness > 100) {
      Runtime.trap("score must be 0-100");
    };

    evictOldestIfCapped(logs, playerId);

    let id = nextId.value;
    nextId.value := id + 1;
    let entry : FlightLog = {
      id;
      playerId;
      completedAt;
      planName;
      plane;
      weather;
      score;
    };
    logs.add(entry);
    entry;
  };

  func evictOldestIfCapped(logs : List.List<FlightLog>, playerId : PlayerId) {
    let owned = logs.filter(
      func(log : FlightLog) : Bool { Principal.equal(log.playerId, playerId) }
    );
    if (owned.size() < maxLogsPerPlayer) {
      return;
    };
    var dropped = false;
    let snapshot = logs.toArray();
    logs.clear();
    for (log in snapshot.values()) {
      if (not dropped and Principal.equal(log.playerId, playerId)) {
        dropped := true;
      } else {
        logs.add(log);
      };
    };
  };
};
