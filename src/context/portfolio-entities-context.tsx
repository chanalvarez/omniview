"use client";

import { createBrowserSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

export type CustomEntity = {
  id: string;
  name: string;
  tagline: string;
  createdAt: number;
  /** Present when an external API connection exists in Supabase */
  integrationConnected?: boolean;
};

type BusinessRow = {
  id: string;
  user_id: string;
  name: string;
  tagline?: string;
  created_at: string;
};

const STORAGE_KEY = "omniview.businesses.v1";
const LEGACY_STORAGE_KEY = "omniview.entities.v1";
const MIGRATION_FLAG = "omniview.cloud_migrated_v1";

function mapRow(r: BusinessRow, connectedIds: Set<string>): CustomEntity {
  return {
    id: r.id,
    name: r.name,
    tagline: r.tagline ?? "",
    createdAt: new Date(r.created_at).getTime(),
    integrationConnected: connectedIds.has(r.id),
  };
}

function migrateLegacyStorage(): string | null {
  try {
    const next = localStorage.getItem(STORAGE_KEY);
    if (next) return next;
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function readLocalBusinesses(): CustomEntity[] {
  try {
    const raw = migrateLegacyStorage();
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomEntity[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type ConnectBusinessResult =
  | { ok: true; entity: CustomEntity }
  | { ok: false; error: string };

type PortfolioEntitiesContextValue = {
  customEntities: CustomEntity[];
  addEntity: (
    input: { name: string; tagline?: string },
  ) => Promise<CustomEntity | null>;
  connectBusiness: (input: { name: string; apiKey: string; baseUrl?: string }) => Promise<ConnectBusinessResult>;
  updateEntity: (
    id: string,
    input: { name: string; tagline: string },
  ) => Promise<boolean>;
  removeEntity: (id: string) => Promise<void>;
  hydrated: boolean;
  session: Session | null;
  cloudMode: boolean;
  supabaseReady: boolean;
  signOut: () => Promise<void>;
};

const PortfolioEntitiesContext =
  createContext<PortfolioEntitiesContextValue | null>(null);

export function PortfolioEntitiesProvider({ children }: { children: ReactNode }) {
  const [customEntities, setCustomEntities] = useState<CustomEntity[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const loadLocalIntoState = useCallback(() => {
    setCustomEntities(readLocalBusinesses());
  }, []);

  const persistLocal = useCallback((list: CustomEntity[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      loadLocalIntoState();
      setHydrated(true);
      return;
    }

    let cancelled = false;

    const loadCloud = async (sess: Session) => {
      if (!localStorage.getItem(MIGRATION_FLAG)) {
        const local = readLocalBusinesses();
        if (local.length > 0) {
          for (const b of local) {
            await supabase.from("businesses").insert({
              id: b.id,
              user_id: sess.user.id,
              name: b.name,
            });
          }
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(MIGRATION_FLAG, "1");
        } else {
          localStorage.setItem(MIGRATION_FLAG, "1");
        }
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("id, user_id, name, created_at")
        .order("created_at", { ascending: true });

      if (cancelled) return;
      if (error) {
        loadLocalIntoState();
        return;
      }

      // Separate query for which businesses have an integration — avoids join errors
      const { data: connData } = await supabase
        .from("external_connections")
        .select("business_id");

      if (cancelled) return;
      const connectedIds = new Set(
        (connData ?? []).map((c: { business_id: string }) => c.business_id),
      );

      setCustomEntities((data as unknown as BusinessRow[]).map((r) => mapRow(r, connectedIds)));
    };

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return;
      setSession(s);
      if (s) {
        setHydrated(true);
        void loadCloud(s);
      } else {
        loadLocalIntoState();
        setHydrated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (cancelled) return;
      setSession(s);
      if (s) {
        setHydrated(true);
        await loadCloud(s);
      } else {
        loadLocalIntoState();
        setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadLocalIntoState]);

  useEffect(() => {
    if (!hydrated) return;
    if (session) return;
    persistLocal(customEntities);
  }, [customEntities, hydrated, session, persistLocal]);

  const connectBusiness = useCallback(
    async (input: { name: string; apiKey: string; baseUrl?: string }): Promise<ConnectBusinessResult> => {
      const name = input.name.trim();
      const apiKey = input.apiKey.trim();
      const baseUrl = input.baseUrl?.trim() ?? "";
      if (!name || !apiKey) {
        return { ok: false, error: "Please fill in all fields." };
      }

      if (!session) {
        return { ok: false, error: "Sign in to connect and store credentials securely." };
      }

      try {
        const res = await fetch("/api/businesses/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            api_key: apiKey,
            ...(baseUrl ? { base_url: baseUrl } : {}),
          }),
        });

        const json = (await res.json()) as {
          error?: string;
          message?: string;
          business?: {
            id: string;
            name: string;
            tagline: string;
            created_at: string;
            integration_connected?: boolean;
          };
        };

        if (!res.ok) {
          const err =
            json.message ??
            (json.error === "verification_failed"
              ? "Could not verify API endpoint."
              : json.error === "integration_not_configured"
                ? "Integration API URL is not configured on the server."
                : json.error) ??
            "Connection failed.";
          return { ok: false, error: err };
        }

        const b = json.business;
        if (!b) {
          return { ok: false, error: "Invalid server response." };
        }

        const entity: CustomEntity = {
          id: b.id,
          name: b.name,
          tagline: b.tagline ?? "",
          createdAt: new Date(b.created_at).getTime(),
          integrationConnected: true,
        };

        setCustomEntities((prev) => [...prev, entity]);

        void fetch(`/api/businesses/${entity.id}/metrics`, {
          credentials: "include",
        });

        return { ok: true, entity };
      } catch {
        return { ok: false, error: "Network error." };
      }
    },
    [session],
  );

  const addEntity = useCallback(
    async (input: { name: string; tagline?: string }): Promise<CustomEntity | null> => {
      const name = input.name.trim();
      if (!name) return null;
      const tagline = (input.tagline ?? "").trim();

      const supabase = createBrowserSupabaseClient();
      if (supabase && session) {
        const { data, error } = await supabase
          .from("businesses")
          .insert({
            user_id: session.user.id,
            name,
            tagline,
          })
          .select()
          .single();

        if (error || !data) return null;
        const entity = mapRow(data as unknown as BusinessRow, new Set<string>());
        setCustomEntities((prev) => [...prev, entity]);
        return entity;
      }

      const entity: CustomEntity = {
        id: crypto.randomUUID(),
        name,
        tagline,
        createdAt: Date.now(),
        integrationConnected: false,
      };
      setCustomEntities((prev) => {
        const next = [...prev, entity];
        persistLocal(next);
        return next;
      });
      return entity;
    },
    [session, persistLocal],
  );

  const updateEntity = useCallback(
    async (id: string, input: { name: string; tagline: string }): Promise<boolean> => {
      const name = input.name.trim();
      if (!name) return false;
      const tagline = input.tagline.trim();

      const supabase = createBrowserSupabaseClient();
      if (supabase && session) {
        const { error } = await supabase
          .from("businesses")
          .update({ name, tagline })
          .eq("id", id)
          .eq("user_id", session.user.id);

        if (error) return false;
        setCustomEntities((prev) =>
          prev.map((e) => (e.id === id ? { ...e, name, tagline } : e)),
        );
        return true;
      }

      setCustomEntities((prev) => {
        const next = prev.map((e) =>
          e.id === id ? { ...e, name, tagline } : e,
        );
        persistLocal(next);
        return next;
      });
      return true;
    },
    [session, persistLocal],
  );

  const removeEntity = useCallback(
    async (id: string) => {
      const supabase = createBrowserSupabaseClient();
      if (supabase && session) {
        await supabase
          .from("businesses")
          .delete()
          .eq("id", id)
          .eq("user_id", session.user.id);
      }
      setCustomEntities((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (!session) persistLocal(next);
        return next;
      });
    },
    [session, persistLocal],
  );

  const signOut = useCallback(async () => {
    // Clear client-side session immediately so UI updates
    setSession(null);
    loadLocalIntoState();
    // Navigate to the server-side sign-out route which properly clears
    // the auth cookie before redirecting to /login.
    window.location.assign("/api/auth/signout");
  }, [loadLocalIntoState]);

  const cloudMode = Boolean(session && isSupabaseConfigured());

  const value = useMemo(
    () => ({
      customEntities,
      addEntity,
      connectBusiness,
      updateEntity,
      removeEntity,
      hydrated,
      session,
      cloudMode,
      supabaseReady: isSupabaseConfigured(),
      signOut,
    }),
    [
      customEntities,
      addEntity,
      connectBusiness,
      updateEntity,
      removeEntity,
      hydrated,
      session,
      cloudMode,
      signOut,
    ],
  );

  return (
    <PortfolioEntitiesContext.Provider value={value}>
      {children}
    </PortfolioEntitiesContext.Provider>
  );
}

export function usePortfolioEntities() {
  const ctx = useContext(PortfolioEntitiesContext);
  if (!ctx) {
    throw new Error(
      "usePortfolioEntities must be used within PortfolioEntitiesProvider",
    );
  }
  return ctx;
}
