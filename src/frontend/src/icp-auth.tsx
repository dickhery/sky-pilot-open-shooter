import { type Backend, createActor } from "@/backend";
import { AuthClient } from "@icp-sdk/auth/client";
import type { Identity } from "@icp-sdk/core/agent";
import { safeGetCanisterEnv } from "@icp-sdk/core/agent/canister-env";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const IDENTITY_PROVIDER = "https://id.ai/authorize";
const MAX_TTL_NS = BigInt(8) * BigInt(3_600_000_000_000);

type IdentityContextValue = {
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  identity: Identity | null;
  login: () => Promise<void>;
  clear: () => Promise<void>;
};

type ActorContextValue = {
  actor: Backend | null;
  isFetching: boolean;
};

const IdentityContext = createContext<IdentityContextValue | null>(null);
const ActorContext = createContext<ActorContextValue>({
  actor: null,
  isFetching: true,
});

export function InternetIdentityProvider({
  children,
}: { children: ReactNode }) {
  const authClient = useMemo(
    () => new AuthClient({ identityProvider: IDENTITY_PROVIDER }),
    [],
  );
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void authClient.getIdentity().then((nextIdentity) => {
      if (cancelled) return;
      setIdentity(nextIdentity);
      setIsAuthenticated(authClient.isAuthenticated());
    });
    return () => {
      cancelled = true;
    };
  }, [authClient]);

  const login = useCallback(async () => {
    setIsLoggingIn(true);
    try {
      const nextIdentity = await authClient.signIn({
        maxTimeToLive: MAX_TTL_NS,
      });
      setIdentity(nextIdentity);
      setIsAuthenticated(true);
    } catch {
      // Popup closed or sign-in rejected — stay anonymous.
    } finally {
      setIsLoggingIn(false);
    }
  }, [authClient]);

  const clear = useCallback(async () => {
    await authClient.signOut();
    const nextIdentity = await authClient.getIdentity();
    setIdentity(nextIdentity);
    setIsAuthenticated(false);
  }, [authClient]);

  const actor = useMemo(() => {
    const canisterEnv = safeGetCanisterEnv();
    const canisterId = canisterEnv?.["PUBLIC_CANISTER_ID:backend"];
    if (!canisterId || !identity) return null;
    return createActor(canisterId, {
      agentOptions: {
        identity,
        rootKey: canisterEnv?.IC_ROOT_KEY,
      },
    });
  }, [identity]);

  const identityValue = useMemo(
    () => ({ isAuthenticated, isLoggingIn, identity, login, clear }),
    [isAuthenticated, isLoggingIn, identity, login, clear],
  );

  const actorValue = useMemo(
    () => ({ actor, isFetching: actor === null }),
    [actor],
  );

  return (
    <IdentityContext.Provider value={identityValue}>
      <ActorContext.Provider value={actorValue}>
        {children}
      </ActorContext.Provider>
    </IdentityContext.Provider>
  );
}

export function useInternetIdentity(): IdentityContextValue {
  const value = useContext(IdentityContext);
  if (!value) {
    throw new Error(
      "useInternetIdentity must be used within InternetIdentityProvider",
    );
  }
  return value;
}

export function useActor(): ActorContextValue {
  return useContext(ActorContext);
}
