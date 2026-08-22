import FlagCodes "flag-codes";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Types "../types/game-change";
import LedgerTypes "../types/icp-ledger";

module {
  public type GameChange = Types.GameChange;
  public type PendingGameChange = Types.PendingGameChange;
  public type GameChangeCounters = Types.GameChangeCounters;

  public let amountE8s : Nat64 = 100_000_000;
  public let feeE8s : Nat64 = 10_000;
  public let lockHours : Nat = 24;
  public let lockNs : Int = 86_400_000_000_000;
  public let pendingTtlNs : Int = 86_400_000_000_000;
  public let maxQueue : Nat = 60;
  public let maxPending : Nat = 80;
  public let defaultPlayerFlag : Text = "us";
  public let defaultEnemyFlag : Text = "ru";
  public let destinationAccount : Text = "9cbc5a569f9ec11a18f8bf590418d2497731208e554ebeff61e80997bef9d99c";
  public let payoutAccount : Blob = "\9c\bc\5a\56\9f\9e\c1\1a\18\f8\bf\59\04\18\d2\49\77\31\20\8e\55\4e\be\ff\61\e8\09\97\be\f9\d9\9c";

  public func paymentInfo() : Types.PaymentInfoView {
    {
      amountE8s;
      feeE8s;
      destinationAccount;
      lockHours;
      maxQueue;
      defaultPlayerFlag;
      defaultEnemyFlag;
    };
  };

  public func sanitizeFlags(playerRaw : Text, enemyRaw : Text) : (Text, Text) {
    let playerFlag = FlagCodes.normalize(playerRaw);
    let enemyFlag = FlagCodes.normalize(enemyRaw);
    if (not FlagCodes.isAllowed(playerFlag)) {
      Runtime.trap("unknown player flag");
    };
    if (not FlagCodes.isAllowed(enemyFlag)) {
      Runtime.trap("unknown enemy flag");
    };
    if (playerFlag == enemyFlag) {
      Runtime.trap("player and enemy flags must be different");
    };
    (playerFlag, enemyFlag);
  };

  public func pruneQueue(queue : List.List<GameChange>, now : Int) {
    var current : ?GameChange = null;
    var future : [GameChange] = [];
    for (slot in queue.values()) {
      if (slot.startAt <= now) {
        current := ?slot;
      } else {
        future := future.concat([slot]);
      };
    };
    queue.clear();
    switch (current) {
      case (?slot) { queue.add(slot) };
      case null {};
    };
    for (slot in future.values()) {
      queue.add(slot);
    };
  };

  public func prunePending(
    pending : Map.Map<Principal, PendingGameChange>,
    now : Int,
  ) {
    var stale : [Principal] = [];
    for ((caller, reservation) in pending.entries()) {
      if (now - reservation.createdAt > pendingTtlNs) {
        stale := stale.concat([caller]);
      };
    };
    for (caller in stale.values()) {
      pending.remove(caller);
    };
  };

  public func nextStartAt(queue : List.List<GameChange>, now : Int) : Int {
    switch (queue.last()) {
      case null { now };
      case (?last) {
        let lockEnd = last.startAt + lockNs;
        if (now < lockEnd) {
          lockEnd;
        } else {
          now;
        };
      };
    };
  };

  public func queuePositionAt(queue : List.List<GameChange>, startAt : Int, now : Int) : Nat {
    if (startAt <= now) {
      return 0;
    };
    var ahead : Nat = 0;
    for (slot in queue.values()) {
      if (slot.startAt > now and slot.startAt < startAt) {
        ahead += 1;
      };
    };
    ahead + 1;
  };

  public func prepare(
    queue : List.List<GameChange>,
    pending : Map.Map<Principal, PendingGameChange>,
    counters : GameChangeCounters,
    caller : Principal,
    playerRaw : Text,
    enemyRaw : Text,
  ) : Types.PrepareView {
    if (caller.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to change the game");
    };
    let now = Time.now();
    pruneQueue(queue, now);
    prunePending(pending, now);
    if (queue.size() >= maxQueue) {
      Runtime.trap("change-the-game queue is full — try again after a slot ends");
    };
    if (pending.size() >= maxPending and not pending.containsKey(caller)) {
      Runtime.trap("too many unfinished reservations — try again shortly");
    };
    let (playerFlag, enemyFlag) = sanitizeFlags(playerRaw, enemyRaw);
    let startAt = nextStartAt(queue, now);
    let memo = counters.nextMemo;
    counters.nextMemo += 1;
    pending.add(
      caller,
      {
        playerFlag;
        enemyFlag;
        memo;
        createdAt = now;
      },
    );
    {
      memo;
      amountE8s;
      feeE8s;
      destinationAccount;
      lockHours;
      queuePosition = queuePositionAt(queue, startAt, now);
      startAt;
    };
  };

  public func verifyTransfer(
    block : LedgerTypes.Block,
    pending : PendingGameChange,
  ) {
    let operation = block.transaction.operation ?? Runtime.trap("payment block has no operation");
    let transfer = switch (operation) {
      case (#Transfer(t)) { t };
      case (_) { Runtime.trap("payment block is not a transfer") };
    };
    if (transfer.to != payoutAccount) {
      Runtime.trap("payment was not sent to the Change the Game account");
    };
    if (transfer.amount.e8s < amountE8s) {
      Runtime.trap("payment must be at least 1.0 ICP");
    };
    if (block.transaction.memo != pending.memo) {
      Runtime.trap("payment memo does not match this reservation");
    };
  };

  public func confirm(
    queue : List.List<GameChange>,
    pending : Map.Map<Principal, PendingGameChange>,
    usedBlocks : Set.Set<Nat64>,
    counters : GameChangeCounters,
    caller : Principal,
    blockIndex : Nat64,
    block : LedgerTypes.Block,
  ) : Types.ConfirmView {
    if (caller.isAnonymous()) {
      Runtime.trap("sign in with Internet Identity to change the game");
    };
    let now = Time.now();
    pruneQueue(queue, now);
    prunePending(pending, now);
    if (usedBlocks.contains(blockIndex)) {
      Runtime.trap("this payment was already used");
    };
    let reservation = pending.get(caller) ?? Runtime.trap("no reserved change — tap Change the Game again before paying");
    if (now - reservation.createdAt > pendingTtlNs) {
      pending.remove(caller);
      Runtime.trap("reservation expired — tap Change the Game again before paying");
    };
    verifyTransfer(block, reservation);
    if (queue.size() >= maxQueue) {
      Runtime.trap("change-the-game queue is full — try again after a slot ends");
    };
    let startAt = nextStartAt(queue, now);
    let id = counters.nextChangeId;
    counters.nextChangeId += 1;
    let slot : GameChange = {
      id;
      playerId = caller;
      playerFlag = reservation.playerFlag;
      enemyFlag = reservation.enemyFlag;
      paidBlock = blockIndex;
      startAt;
      createdAt = now;
    };
    queue.add(slot);
    usedBlocks.add(blockIndex);
    pending.remove(caller);
    {
      id;
      playerFlag = slot.playerFlag;
      enemyFlag = slot.enemyFlag;
      startAt;
      lockUntil = startAt + lockNs;
      queuePosition = queuePositionAt(queue, startAt, now);
    };
  };

  public func activeFlags(queue : List.List<GameChange>, now : Int) : Types.ActiveFlagsView {
    var current : ?GameChange = null;
    var queued : Nat = 0;
    for (slot in queue.values()) {
      if (slot.startAt <= now) {
        current := ?slot;
      } else {
        queued += 1;
      };
    };
    switch (current) {
      case (?slot) {
        {
          playerFlag = slot.playerFlag;
          enemyFlag = slot.enemyFlag;
          lockUntil = slot.startAt + lockNs;
          holder = ?slot.playerId;
          queued;
        };
      };
      case null {
        {
          playerFlag = defaultPlayerFlag;
          enemyFlag = defaultEnemyFlag;
          lockUntil = 0;
          holder = null;
          queued;
        };
      };
    };
  };

  public func queueViews(queue : List.List<GameChange>, now : Int) : [Types.QueueSlotView] {
    var current : ?GameChange = null;
    var future : [GameChange] = [];
    for (slot in queue.values()) {
      if (slot.startAt <= now) {
        current := ?slot;
      } else {
        future := future.concat([slot]);
      };
    };
    var out : [Types.QueueSlotView] = [];
    switch (current) {
      case (?slot) { out := [toView(slot, now)] };
      case null {};
    };
    for (slot in future.values()) {
      out := out.concat([toView(slot, now)]);
    };
    out;
  };

  func toView(slot : GameChange, now : Int) : Types.QueueSlotView {
    let lockUntil = slot.startAt + lockNs;
    let status : Types.SlotStatus = if (slot.startAt > now) {
      #queued;
    } else if (now < lockUntil) {
      #live;
    } else {
      #holding;
    };
    {
      id = slot.id;
      playerFlag = slot.playerFlag;
      enemyFlag = slot.enemyFlag;
      startAt = slot.startAt;
      lockUntil;
      status;
    };
  };
};
