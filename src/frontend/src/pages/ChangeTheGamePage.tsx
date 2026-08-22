import type { ConfirmView, PrepareView, QueueSlotView } from "@/backend";
import { SlotStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useActiveGameFlags,
  useConfirmGameChange,
  useGameChangePaymentInfo,
  useGameChangeQueue,
  usePrepareGameChange,
} from "@/hooks/useFlightData";
import { useActor, useInternetIdentity } from "@/icp-auth";
import {
  COUNTRIES,
  DEFAULT_ENEMY_FLAG,
  DEFAULT_PLAYER_FLAG,
  countryName,
  flagEmoji,
} from "@/lib/countries";
import {
  CHANGE_GAME_ACCOUNT,
  createLedgerActor,
  formatIcp,
  formatNsDate,
  hoursUntil,
  readIcpBalanceE8s,
  transferChangeGamePayment,
} from "@/lib/icp-ledger";
import { safeGetCanisterEnv } from "@icp-sdk/core/agent/canister-env";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Flag,
  Loader2,
  LogIn,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

/**
 * Pay 1 ICP to lock a player flag and an enemy flag into the theater
 * for 24 hours (FIFO queue if a slot is already live).
 */
export function ChangeTheGamePage() {
  const { isAuthenticated, login, isLoggingIn, identity } =
    useInternetIdentity();
  const { actor } = useActor();
  const flagsQuery = useActiveGameFlags();
  const infoQuery = useGameChangePaymentInfo();
  const queueQuery = useGameChangeQueue();
  const prepare = usePrepareGameChange();
  const confirm = useConfirmGameChange();

  const [playerFlag, setPlayerFlag] = useState(DEFAULT_PLAYER_FLAG);
  const [enemyFlag, setEnemyFlag] = useState(DEFAULT_ENEMY_FLAG);
  const [playerFilter, setPlayerFilter] = useState("");
  const [enemyFilter, setEnemyFilter] = useState("");
  const [busy, setBusy] = useState<null | "prepare" | "pay" | "confirm">(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConfirmView | null>(null);
  const [pendingBlock, setPendingBlock] = useState<bigint | null>(null);
  const [manualBlock, setManualBlock] = useState("");
  const [balanceE8s, setBalanceE8s] = useState<bigint | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [reservation, setReservation] = useState<PrepareView | null>(null);

  const info = infoQuery.data;
  const active = flagsQuery.data;
  const queue = queueQuery.data ?? [];
  const dest = info?.destinationAccount ?? CHANGE_GAME_ACCOUNT;
  const amount = info?.amountE8s ?? 100_000_000n;
  const fee = info?.feeE8s ?? 10_000n;

  const sameFlags = playerFlag === enemyFlag;
  const paying = busy !== null;

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  async function refreshBalance() {
    if (!identity) return;
    try {
      const env = safeGetCanisterEnv();
      const ledger = createLedgerActor(identity, env?.IC_ROOT_KEY);
      const bal = await readIcpBalanceE8s(ledger, identity.getPrincipal());
      setBalanceE8s(bal);
    } catch {
      setBalanceE8s(null);
    }
  }

  async function confirmWithRetries(blockIndex: bigint) {
    let last: unknown;
    for (let i = 0; i < 3; i++) {
      try {
        return await confirm.mutateAsync(blockIndex);
      } catch (err) {
        last = err;
        await sleep(1400);
      }
    }
    throw last instanceof Error ? last : new Error(String(last));
  }

  async function payAndLock() {
    if (!actor || !identity) return;
    if (sameFlags) {
      setError(
        "Pick two different countries so both sides are readable in-game.",
      );
      return;
    }
    setError(null);
    setResult(null);
    try {
      setBusy("prepare");
      const prepared = await prepare.mutateAsync({ playerFlag, enemyFlag });
      setReservation(prepared);
      setBusy("pay");
      const env = safeGetCanisterEnv();
      const ledger = createLedgerActor(identity, env?.IC_ROOT_KEY);
      const blockIndex = await transferChangeGamePayment(
        ledger,
        prepared.memo,
        prepared.amountE8s,
        prepared.feeE8s,
        prepared.destinationAccount,
      );
      setPendingBlock(blockIndex);
      setBusy("confirm");
      const confirmed = await confirmWithRetries(blockIndex);
      setResult(confirmed);
      setPendingBlock(null);
      await Promise.all([flagsQuery.refetch(), queueQuery.refetch()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
      void refreshBalance();
    }
  }

  async function retryConfirm() {
    if (pendingBlock === null) return;
    setError(null);
    setBusy("confirm");
    try {
      const confirmed = await confirmWithRetries(pendingBlock);
      setResult(confirmed);
      setPendingBlock(null);
      await Promise.all([flagsQuery.refetch(), queueQuery.refetch()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function reserveMemo() {
    if (sameFlags) {
      setError(
        "Pick two different countries so both sides are readable in-game.",
      );
      return;
    }
    setError(null);
    setBusy("prepare");
    try {
      const prepared = await prepare.mutateAsync({ playerFlag, enemyFlag });
      setReservation(prepared);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function confirmManual() {
    const trimmed = manualBlock.trim();
    if (!trimmed) return;
    if (!reservation) {
      setError("Reserve a memo first so the canister can match your payment.");
      return;
    }
    let blockIndex: bigint;
    try {
      blockIndex = BigInt(trimmed);
    } catch {
      setError("Block index must be a number from the ICP ledger.");
      return;
    }
    setError(null);
    setBusy("confirm");
    try {
      const confirmed = await confirmWithRetries(blockIndex);
      setResult(confirmed);
      setPendingBlock(null);
      setReservation(null);
      await Promise.all([flagsQuery.refetch(), queueQuery.refetch()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8"
      data-ocid="change_game.page"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Flag className="size-5" aria-hidden="true" />
          <span className="hud-label text-[11px] text-muted-foreground">
            Theater Paint
          </span>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Change the Game
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pay 1.0 ICP to fly your country's colors on the strike craft and
          friendly fields, and hang a rival flag on every hostile base and
          bandit. The pair is locked for 24 hours, then stays painted until the
          next paid change takes over.
        </p>
      </header>

      <ActiveBanner active={active} />

      <HowItWorks dest={dest} amount={amount} fee={fee} />

      <QueueBoard
        rows={queue}
        onRefresh={() => {
          void flagsQuery.refetch();
          void queueQuery.refetch();
        }}
        refreshing={queueQuery.isFetching}
      />

      <Card className="border-border bg-card/80">
        <CardContent className="flex flex-col gap-6 py-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Choose flags
            </h2>
            <p className="text-sm text-muted-foreground">
              Player marks your jet, helicopter, and both airfields. Enemy marks
              every outpost you are clearing and the bandits in the air.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FlagPicker
              title="Player"
              code={playerFlag}
              filter={playerFilter}
              onFilter={setPlayerFilter}
              onSelect={setPlayerFlag}
              blocked={enemyFlag}
            />
            <FlagPicker
              title="Enemy"
              code={enemyFlag}
              filter={enemyFilter}
              onFilter={setEnemyFilter}
              onSelect={setEnemyFlag}
              blocked={playerFlag}
            />
          </div>

          {sameFlags && (
            <p className="text-sm text-accent">
              Pick two different countries so both teams stay distinct in the
              theater.
            </p>
          )}

          {!isAuthenticated ? (
            <Button
              type="button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="hud-label self-start gap-2"
              data-ocid="change_game.sign_in.button"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Payment leaves the Internet Identity account you signed in with.
                Fund it with at least {formatIcp(amount + fee)} ICP (1.0 plus
                the ledger fee of {formatIcp(fee)}). You can also pay from
                another wallet using the memo created when you tap pay, then
                paste the ledger block index below.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refreshBalance()}
                >
                  Check II balance
                </Button>
                {balanceE8s !== null && (
                  <span className="hud-label text-[11px] text-muted-foreground">
                    {formatIcp(balanceE8s)} ICP
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => payAndLock()}
                  disabled={paying || sameFlags}
                  className="hud-label gap-2"
                  data-ocid="change_game.pay.button"
                >
                  {paying ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Flag className="size-4" aria-hidden="true" />
                  )}
                  {busyLabel(busy) ?? `Pay ${formatIcp(amount)} ICP`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={paying || sameFlags}
                  onClick={() => reserveMemo()}
                >
                  Reserve memo
                </Button>
              </div>
              {reservation && (
                <p className="text-xs text-muted-foreground">
                  Memo {reservation.memo.toString()} · slot{" "}
                  {reservation.queuePosition === 0n
                    ? "goes live after confirm"
                    : `#${reservation.queuePosition.toString()}`}
                  . Use this memo if you pay from another wallet. Reservation
                  lasts 24 hours.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {pendingBlock !== null && (
            <div className="flex flex-col gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
              <p>
                ICP left this account in block {pendingBlock.toString()}.
                Confirm it on-chain if the lock did not finish.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => retryConfirm()}
                disabled={paying}
              >
                Retry confirm
              </Button>
            </div>
          )}

          {result && <ResultBanner result={result} />}

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="hud-label text-[10px] text-muted-foreground">
              Paying from NNS or another wallet? Tap Reserve memo, send 1.0 ICP
              to the account with that memo, then paste the ledger block index.
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                value={manualBlock}
                onChange={(e) => setManualBlock(e.target.value)}
                placeholder="Ledger block index"
                className="max-w-xs"
                inputMode="numeric"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!isAuthenticated || paying || sameFlags}
                onClick={() => confirmManual()}
              >
                Confirm block
              </Button>
            </div>
            <button
              type="button"
              className="hud-label self-start text-[10px] text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => copyText("account", dest)}
            >
              <Copy className="mr-1 inline size-3" aria-hidden="true" />
              {copied === "account" ? "Copied account" : dest}
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

function ActiveBanner({
  active,
}: {
  active: ReturnType<typeof useActiveGameFlags>["data"];
}) {
  if (!active) return null;
  const locked =
    active.lockUntil > 0n && Number(active.lockUntil) / 1e6 > Date.now();
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {flagEmoji(active.playerFlag)}
          </span>
          <span className="hud-label text-xs text-muted-foreground">vs</span>
          <span className="text-3xl" aria-hidden="true">
            {flagEmoji(active.enemyFlag)}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-foreground">
              {countryName(active.playerFlag)} vs{" "}
              {countryName(active.enemyFlag)}
            </p>
            <p className="text-xs text-muted-foreground">
              {locked
                ? `Locked for ${hoursUntil(active.lockUntil)}`
                : active.holder
                  ? "Lock ended — still flying until the next paid change"
                  : "Default theater paint"}
            </p>
          </div>
        </div>
        <p className="hud-label text-[10px] text-muted-foreground">
          {Number(active.queued)} queued behind this slot
        </p>
      </CardContent>
    </Card>
  );
}

function HowItWorks({
  dest,
  amount,
  fee,
}: {
  dest: string;
  amount: bigint;
  fee: bigint;
}) {
  return (
    <Card className="border-border bg-card/70">
      <CardContent className="flex flex-col gap-3 py-6 text-sm leading-relaxed text-muted-foreground">
        <h2 className="font-display text-lg font-semibold text-foreground">
          How payment and the queue work
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Sign in with Internet Identity, pick a player flag and an enemy
            flag, then pay{" "}
            <strong className="text-foreground">{formatIcp(amount)} ICP</strong>{" "}
            plus a {formatIcp(fee)} ICP ledger fee.
          </li>
          <li>
            Funds go to account{" "}
            <code className="break-all text-xs text-foreground">{dest}</code>—
            not to the game canister. The canister only reads the ledger to
            prove the transfer happened.
          </li>
          <li>
            If nobody holds a live 24-hour lock, your flags go up immediately.
            If a lock is already running, your change lines up behind it. Each
            queued payment gets its own full 24-hour lock, in the order paid, so
            the line can grow fairly (up to 60 slots).
          </li>
          <li>
            After 24 hours the pair stays in the theater until the next paid
            slot starts. You do not need to pay again to keep flying those
            colors — only the next player who pays can replace them.
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}

function QueueBoard({
  rows,
  onRefresh,
  refreshing,
}: {
  rows: QueueSlotView[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Queue
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>
      {rows.length === 0 ? (
        <Card className="border-border bg-card/70">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No paid changes yet. First payment paints the default theater and
            starts a 24-hour lock.
          </CardContent>
        </Card>
      ) : (
        <ol className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.id.toString()}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/80 px-4 py-3"
            >
              <span className="text-xl" aria-hidden="true">
                {flagEmoji(row.playerFlag)}
              </span>
              <span className="text-xl" aria-hidden="true">
                {flagEmoji(row.enemyFlag)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {countryName(row.playerFlag)} vs {countryName(row.enemyFlag)}
                </p>
                <p className="hud-label text-[10px] text-muted-foreground">
                  {statusLabel(row.status)} · {formatNsDate(row.startAt)} →{" "}
                  {formatNsDate(row.lockUntil)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FlagPicker({
  title,
  code,
  filter,
  onFilter,
  onSelect,
  blocked,
}: {
  title: string;
  code: string;
  filter: string;
  onFilter: (value: string) => void;
  onSelect: (code: string) => void;
  blocked: string;
}) {
  const matches = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q),
    );
  }, [filter]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">
          {flagEmoji(code)}
        </span>
        <div>
          <p className="hud-label text-[10px] text-muted-foreground">{title}</p>
          <p className="font-display text-base font-semibold text-foreground">
            {countryName(code)}
          </p>
        </div>
      </div>
      <Input
        value={filter}
        onChange={(e) => onFilter(e.target.value)}
        placeholder={`Search ${title.toLowerCase()} country`}
        aria-label={`Search ${title} country`}
      />
      <div className="max-h-56 overflow-y-auto rounded-md border border-border">
        {matches.map((country) => {
          const selected = country.code === code;
          const disabled = country.code === blocked;
          return (
            <button
              key={country.code}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(country.code)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                selected
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
              } disabled:opacity-40`}
            >
              <span aria-hidden="true">{flagEmoji(country.code)}</span>
              <span className="flex-1 truncate">{country.name}</span>
              <span className="hud-label text-[10px]">{country.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultBanner({ result }: { result: ConfirmView }) {
  const live = result.queuePosition === 0n;
  return (
    <div className="flex items-start gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        {flagEmoji(result.playerFlag)} vs {flagEmoji(result.enemyFlag)}{" "}
        {live
          ? "is live in the theater now."
          : `is queued (slot ${result.queuePosition.toString()}). It starts ${formatNsDate(result.startAt)} and stays locked until ${formatNsDate(result.lockUntil)}.`}
      </p>
    </div>
  );
}

function statusLabel(status: SlotStatus): string {
  switch (status) {
    case SlotStatus.live:
      return "Live lock";
    case SlotStatus.queued:
      return "Queued";
    case SlotStatus.holding:
      return "Holding after lock";
    default:
      return String(status);
  }
}

function busyLabel(busy: null | "prepare" | "pay" | "confirm"): string | null {
  if (busy === "prepare") return "Reserving memo…";
  if (busy === "pay") return "Sending 1.0 ICP…";
  if (busy === "confirm") return "Confirming on-chain…";
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
