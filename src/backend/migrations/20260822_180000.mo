import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Set "mo:core/Set";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  public type Plane = {
    #cessna;
    #gulfstream;
  };

  public type Weather = {
    #daytime;
    #nighttime;
    #partlyCloudy;
  };

  public type ScoreBreakdown = {
    speed : Nat;
    landingSmoothness : Nat;
    total : Nat;
  };

  public type FlightLog = {
    id : Nat;
    playerId : Principal;
    completedAt : Int;
    planName : Text;
    plane : Plane;
    weather : Weather;
    score : ScoreBreakdown;
  };

  public type LeaderboardEntry = {
    id : Nat;
    playerId : Principal;
    displayName : Text;
    planName : Text;
    plane : Plane;
    weather : Weather;
    total : Nat;
    submittedAt : Int;
  };

  public type GameChange = {
    id : Nat;
    playerId : Principal;
    playerFlag : Text;
    enemyFlag : Text;
    paidBlock : Nat64;
    startAt : Int;
    createdAt : Int;
  };

  public type PendingGameChange = {
    playerFlag : Text;
    enemyFlag : Text;
    memo : Nat64;
    createdAt : Int;
  };

  type OldActor = {
    accessControlState : AccessControlState;
    flightLogs : List.List<FlightLog>;
    nextLogId : { var value : Nat };
    leaderboard : List.List<LeaderboardEntry>;
    nextLeaderboardId : { var value : Nat };
  };

  type NewActor = {
    accessControlState : AccessControlState;
    flightLogs : List.List<FlightLog>;
    nextLogId : { var value : Nat };
    leaderboard : List.List<LeaderboardEntry>;
    nextLeaderboardId : { var value : Nat };
    gameChangeQueue : List.List<GameChange>;
    pendingGameChanges : Map.Map<Principal, PendingGameChange>;
    usedPaymentBlocks : Set.Set<Nat64>;
    gameChangeCounters : { var nextChangeId : Nat; var nextMemo : Nat64 };
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      flightLogs = old.flightLogs;
      nextLogId = old.nextLogId;
      leaderboard = old.leaderboard;
      nextLeaderboardId = old.nextLeaderboardId;
      gameChangeQueue = List.empty();
      pendingGameChanges = Map.empty();
      usedPaymentBlocks = Set.empty();
      gameChangeCounters = { var nextChangeId = 1; var nextMemo = 1 };
    };
  };
};
