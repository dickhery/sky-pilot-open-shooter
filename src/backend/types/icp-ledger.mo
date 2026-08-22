module {
  public type AccountIdentifier = Blob;
  public type Memo = Nat64;
  public type BlockIndex = Nat64;
  public type Tokens = { e8s : Nat64 };
  public type TimeStamp = { timestamp_nanos : Nat64 };
  public type SubAccount = Blob;

  public type GetBlocksArgs = {
    start : BlockIndex;
    length : Nat64;
  };

  public type Operation = {
    #Mint : { to : AccountIdentifier; amount : Tokens };
    #Burn : {
      from : AccountIdentifier;
      spender : ?AccountIdentifier;
      amount : Tokens;
    };
    #Transfer : {
      from : AccountIdentifier;
      to : AccountIdentifier;
      amount : Tokens;
      fee : Tokens;
      spender : ?[Nat8];
    };
    #Approve : {
      from : AccountIdentifier;
      spender : AccountIdentifier;
      allowance_e8s : Int;
      allowance : Tokens;
      fee : Tokens;
      expires_at : ?TimeStamp;
      expected_allowance : ?Tokens;
    };
  };

  public type Transaction = {
    memo : Memo;
    icrc1_memo : ?Blob;
    operation : ?Operation;
    created_at_time : TimeStamp;
  };

  public type Block = {
    parent_hash : ?Blob;
    transaction : Transaction;
    timestamp : TimeStamp;
  };

  public type BlockRange = { blocks : [Block] };

  public type QueryArchiveError = {
    #BadFirstBlockIndex : {
      requested_index : BlockIndex;
      first_valid_index : BlockIndex;
    };
    #Other : { error_code : Nat64; error_message : Text };
  };

  public type QueryArchiveResult = {
    #Ok : BlockRange;
    #Err : QueryArchiveError;
  };

  public type QueryArchiveFn = shared query (GetBlocksArgs) -> async QueryArchiveResult;

  public type ArchivedBlocksRange = {
    start : BlockIndex;
    length : Nat64;
    callback : QueryArchiveFn;
  };

  public type QueryBlocksResponse = {
    chain_length : Nat64;
    certificate : ?Blob;
    blocks : [Block];
    first_block_index : BlockIndex;
    archived_blocks : [ArchivedBlocksRange];
  };

  public type IcpLedger = actor {
    query_blocks : shared query (GetBlocksArgs) -> async QueryBlocksResponse;
  };
};
