module {
  public type FlagCode = Text;
  public type Memo = Nat64;
  public type BlockIndex = Nat64;

  /// One paid 24-hour flag slot. After `startAt + lock` the pair stays on
  /// screen until a later slot's `startAt`.
  public type GameChange = {
    id : Nat;
    playerId : Principal;
    playerFlag : FlagCode;
    enemyFlag : FlagCode;
    paidBlock : BlockIndex;
    startAt : Int;
    createdAt : Int;
  };

  /// Unsigned reservation that binds a ledger memo to a caller until they
  /// confirm the 1 ICP transfer (or the reservation expires).
  public type PendingGameChange = {
    playerFlag : FlagCode;
    enemyFlag : FlagCode;
    memo : Memo;
    createdAt : Int;
  };

  public type GameChangeCounters = {
    var nextChangeId : Nat;
    var nextMemo : Nat64;
  };

  public type PrepareView = {
    memo : Memo;
    amountE8s : Nat64;
    feeE8s : Nat64;
    destinationAccount : Text;
    lockHours : Nat;
    queuePosition : Nat;
    startAt : Int;
  };

  public type ConfirmView = {
    id : Nat;
    playerFlag : FlagCode;
    enemyFlag : FlagCode;
    startAt : Int;
    lockUntil : Int;
    queuePosition : Nat;
  };

  public type ActiveFlagsView = {
    playerFlag : FlagCode;
    enemyFlag : FlagCode;
    lockUntil : Int;
    holder : ?Principal;
    queued : Nat;
  };

  public type SlotStatus = {
    #live;
    #queued;
    #holding;
  };

  public type QueueSlotView = {
    id : Nat;
    playerFlag : FlagCode;
    enemyFlag : FlagCode;
    startAt : Int;
    lockUntil : Int;
    status : SlotStatus;
  };

  public type PaymentInfoView = {
    amountE8s : Nat64;
    feeE8s : Nat64;
    destinationAccount : Text;
    lockHours : Nat;
    maxQueue : Nat;
    defaultPlayerFlag : FlagCode;
    defaultEnemyFlag : FlagCode;
  };
};
