import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Leaderboard "../lib/leaderboard";
import Types "../types/leaderboard";

mixin (
  entries : List.List<Types.LeaderboardEntry>,
  nextEntryId : { var value : Nat },
) {
  transient var boardWriteWindowStart : Int = 0;
  transient var boardWriteWindowCount : Nat = 0;
  /// Public query of the top scores for every catalog map. Cheap read —
  /// no authentication, one call for the whole board.
  public query func listLeaderboard() : async [Types.LeaderboardEntryView] {
    Leaderboard.listTop(entries);
  };

  /// Post a completed flight's total to that map's board. Requires Internet Identity.
  public shared ({ caller }) func submitLeaderboardScore(
    displayName : Text,
    planName : Text,
    plane : Types.Plane,
    weather : Types.Weather,
    total : Nat,
  ) : async Types.SubmitOutcome {
    if (caller.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to post a score");
    };
    throttleBoardWrites();
    Leaderboard.submit(entries, nextEntryId, caller, displayName, planName, plane, weather, total);
  };

  func throttleBoardWrites() {
    let now = Time.now();
    let windowNs : Int = 60_000_000_000;
    if (now - boardWriteWindowStart > windowNs) {
      boardWriteWindowStart := now;
      boardWriteWindowCount := 0;
    };
    if (boardWriteWindowCount >= 20) {
      Runtime.trap("too many writes — try again in a minute");
    };
    boardWriteWindowCount += 1;
  };
};
