import {
  Actor,
  HttpAgent,
  type HttpAgentOptions,
  type Identity,
} from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";

export const ICP_LEDGER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
export const CHANGE_GAME_ACCOUNT =
  "9cbc5a569f9ec11a18f8bf590418d2497731208e554ebeff61e80997bef9d99c";
export const CHANGE_GAME_AMOUNT_E8S = 100_000_000n;
export const ICP_TRANSFER_FEE_E8S = 10_000n;

const ledgerIdl = ({
  IDL,
}: { IDL: Parameters<IDL.InterfaceFactory>[0]["IDL"] }) => {
  const Tokens = IDL.Record({ e8s: IDL.Nat64 });
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 });
  const TransferError = IDL.Variant({
    BadFee: IDL.Record({ expected_fee: Tokens }),
    InsufficientFunds: IDL.Record({ balance: Tokens }),
    TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
    TxCreatedInFuture: IDL.Null,
    TxDuplicate: IDL.Record({ duplicate_of: IDL.Nat64 }),
  });
  const TransferArgs = IDL.Record({
    memo: IDL.Nat64,
    amount: Tokens,
    fee: Tokens,
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    to: IDL.Vec(IDL.Nat8),
    created_at_time: IDL.Opt(TimeStamp),
  });
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  return IDL.Service({
    transfer: IDL.Func(
      [TransferArgs],
      [IDL.Variant({ Ok: IDL.Nat64, Err: TransferError })],
      [],
    ),
    icrc1_balance_of: IDL.Func([Account], [IDL.Nat], ["query"]),
    account_identifier: IDL.Func([Account], [IDL.Vec(IDL.Nat8)], ["query"]),
  });
};

type LedgerService = {
  transfer: (arg: {
    memo: bigint;
    amount: { e8s: bigint };
    fee: { e8s: bigint };
    from_subaccount: [] | [Uint8Array];
    to: Uint8Array;
    created_at_time: [] | [{ timestamp_nanos: bigint }];
  }) => Promise<{ Ok: bigint } | { Err: unknown }>;
  icrc1_balance_of: (account: {
    owner: Principal;
    subaccount: [] | [Uint8Array];
  }) => Promise<bigint>;
  account_identifier: (account: {
    owner: Principal;
    subaccount: [] | [Uint8Array];
  }) => Promise<Uint8Array>;
};

export interface PlayerIcpAccount {
  principalText: string;
  accountId: string;
  balanceE8s: bigint;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function createLedgerActor(
  identity: Identity,
  rootKey?: HttpAgentOptions["rootKey"],
): LedgerService {
  const agent = HttpAgent.createSync({
    identity,
    rootKey,
  });
  return Actor.createActor<LedgerService>(ledgerIdl, {
    agent,
    canisterId: ICP_LEDGER_ID,
  });
}

export async function readIcpBalanceE8s(
  ledger: LedgerService,
  owner: Principal,
): Promise<bigint> {
  return ledger.icrc1_balance_of({ owner, subaccount: [] });
}

/** Default ICP account for an Internet Identity principal — the 64-hex id wallets send to. */
export async function readPlayerIcpAccount(
  ledger: LedgerService,
  owner: Principal,
): Promise<PlayerIcpAccount> {
  const account = { owner, subaccount: [] as [] | [Uint8Array] };
  const [balanceE8s, accountBlob] = await Promise.all([
    ledger.icrc1_balance_of(account),
    ledger.account_identifier(account),
  ]);
  return {
    principalText: owner.toText(),
    accountId: bytesToHex(accountBlob),
    balanceE8s,
  };
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

export async function transferChangeGamePayment(
  ledger: LedgerService,
  memo: bigint,
  amountE8s: bigint,
  feeE8s: bigint,
  destinationHex: string,
): Promise<bigint> {
  const createdAt = BigInt(Date.now()) * 1_000_000n;
  const result = await ledger.transfer({
    memo,
    amount: { e8s: amountE8s },
    fee: { e8s: feeE8s },
    from_subaccount: [],
    to: hexToBytes(destinationHex),
    created_at_time: [{ timestamp_nanos: createdAt }],
  });
  if ("Ok" in result) {
    return result.Ok;
  }
  throw new Error(formatTransferError(result.Err));
}

function formatTransferError(err: unknown): string {
  if (!err || typeof err !== "object") {
    return "ICP transfer failed";
  }
  const rec = err as Record<string, unknown>;
  if ("InsufficientFunds" in rec) {
    const funds = rec.InsufficientFunds as { balance?: { e8s?: bigint } };
    const have = funds.balance?.e8s ?? 0n;
    return `Not enough ICP in this Internet Identity account (have ${formatIcp(have)}, need 1.0001 ICP including the fee). Send ICP to this identity from the NNS or an exchange, then try again.`;
  }
  if ("BadFee" in rec) {
    return "Ledger fee changed — refresh the page and try again.";
  }
  if ("TxDuplicate" in rec) {
    const dup = rec.TxDuplicate as { duplicate_of?: bigint };
    if (dup.duplicate_of !== undefined) {
      return `Duplicate transfer — already recorded as block ${dup.duplicate_of.toString()}`;
    }
  }
  if ("TxTooOld" in rec) {
    return "Payment request expired — try again.";
  }
  if ("TxCreatedInFuture" in rec) {
    return "Device clock is ahead of the network — check the time and retry.";
  }
  return "ICP transfer failed";
}

export function formatIcp(e8s: bigint): string {
  const whole = e8s / 100_000_000n;
  const frac = (e8s % 100_000_000n)
    .toString()
    .padStart(8, "0")
    .replace(/0+$/, "");
  return frac.length > 0 ? `${whole.toString()}.${frac}` : whole.toString();
}

export function formatNsDate(ts: bigint): string {
  const raw = Number(ts);
  if (!Number.isFinite(raw) || raw <= 0) return "—";
  const ms = raw > 1e14 ? raw / 1e6 : raw;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hoursUntil(ts: bigint): string {
  const raw = Number(ts);
  if (!Number.isFinite(raw) || raw <= 0) return "";
  const ms = raw > 1e14 ? raw / 1e6 : raw;
  const delta = ms - Date.now();
  if (delta <= 0) return "now";
  const hours = Math.round(delta / 3_600_000);
  if (hours < 1) {
    const mins = Math.max(1, Math.round(delta / 60_000));
    return `${mins} min`;
  }
  if (hours < 48) return `${hours} hr`;
  const days = Math.round(hours / 24);
  return `${days} days`;
}
