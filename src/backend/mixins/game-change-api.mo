import List "mo:core/List";
import Map "mo:core/Map";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Time "mo:core/Time";
import GameChange "../lib/game-change";
import Types "../types/game-change";
import LedgerTypes "../types/icp-ledger";

mixin (
  queue : List.List<Types.GameChange>,
  pending : Map.Map<Principal, Types.PendingGameChange>,
  usedBlocks : Set.Set<Nat64>,
  counters : Types.GameChangeCounters,
) {
  transient let icpLedger : LedgerTypes.IcpLedger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");
  transient let confirmLocks = Map.empty<Principal, Bool>();
  transient var changeWriteWindowStart : Int = 0;
  transient var changeWriteWindowCount : Nat = 0;

  /// Public constants for the payment page. Query-only.
  public query func getGameChangePaymentInfo() : async Types.PaymentInfoView {
    GameChange.paymentInfo();
  };

  /// Flags currently painted in-game, plus how many paid slots wait behind.
  public query func getActiveGameFlags() : async Types.ActiveFlagsView {
    GameChange.activeFlags(queue, Time.now());
  };

  /// Live slot (or holding pair) plus the FIFO of future 24-hour slots.
  public query func listGameChangeQueue() : async [Types.QueueSlotView] {
    GameChange.queueViews(queue, Time.now());
  };

  /// Reserve a unique ledger memo for this caller's flag pair.
  public shared ({ caller }) func prepareGameChange(
    playerFlag : Text,
    enemyFlag : Text,
  ) : async Types.PrepareView {
    if (caller.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to change the game");
    };
    throttleWrites();
    GameChange.prepare(queue, pending, counters, caller, playerFlag, enemyFlag);
  };

  /// Verify the 1 ICP transfer on the ICP ledger, then enqueue the slot.
  public shared ({ caller }) func confirmGameChange(
    blockIndex : Nat64,
  ) : async Types.ConfirmView {
    if (caller.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to change the game");
    };
    throttleWrites();
    switch (acquireLock(caller)) {
      case (#err(msg)) { Runtime.trap(msg) };
      case (#ok) {};
    };
    try {
      let block = await fetchBlock(blockIndex);
      GameChange.confirm(queue, pending, usedBlocks, counters, caller, blockIndex, block);
    } finally {
      releaseLock(caller);
    };
  };

  func fetchBlock(blockIndex : Nat64) : async LedgerTypes.Block {
    let args : LedgerTypes.GetBlocksArgs = { start = blockIndex; length = 1 };
    let response = await icpLedger.query_blocks(args);
    if (response.blocks.size() > 0) {
      return response.blocks[0];
    };
    if (response.archived_blocks.size() == 0) {
      Runtime.trap("payment block not found");
    };
    let archive = response.archived_blocks[0];
    let archived = await archive.callback(args);
    switch (archived) {
      case (#Ok({ blocks })) {
        if (blocks.size() == 0) {
          Runtime.trap("payment block not found in archive");
        };
        blocks[0];
      };
      case (#Err(_)) {
        Runtime.trap("could not load payment block from archive");
      };
    };
  };

  func acquireLock(caller : Principal) : Result.Result<(), Text> {
    if (confirmLocks.get(caller) != null) {
      return #err("already confirming a payment");
    };
    confirmLocks.add(caller, true);
    #ok;
  };

  func releaseLock(caller : Principal) {
    confirmLocks.remove(caller);
  };

  func throttleWrites() {
    let now = Time.now();
    let windowNs : Int = 60_000_000_000;
    if (now - changeWriteWindowStart > windowNs) {
      changeWriteWindowStart := now;
      changeWriteWindowCount := 0;
    };
    if (changeWriteWindowCount >= 20) {
      Runtime.trap("too many writes — try again in a minute");
    };
    changeWriteWindowCount += 1;
  };
};
