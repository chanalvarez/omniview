"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CustomEntity = {
  id: string;
  name: string;
  tagline: string;
  createdAt: number;
};

const STORAGE_KEY = "omniview.businesses.v1";
const LEGACY_STORAGE_KEY = "omniview.entities.v1";

type PortfolioEntitiesContextValue = {
  customEntities: CustomEntity[];
  addEntity: (input: { name: string; tagline?: string }) => CustomEntity | null;
  updateEntity: (
    id: string,
    input: { name: string; tagline: string },
  ) => boolean;
  removeEntity: (id: string) => void;
  hydrated: boolean;
};

const PortfolioEntitiesContext =
  createContext<PortfolioEntitiesContextValue | null>(null);

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

export function PortfolioEntitiesProvider({ children }: { children: ReactNode }) {
  const [customEntities, setCustomEntities] = useState<CustomEntity[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = migrateLegacyStorage();
      if (raw) {
        const parsed = JSON.parse(raw) as CustomEntity[];
        if (Array.isArray(parsed)) setCustomEntities(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customEntities));
    } catch {
      /* ignore */
    }
  }, [customEntities, hydrated]);

  const addEntity = useCallback((input: {
    name: string;
    tagline?: string;
  }): CustomEntity | null => {
    const name = input.name.trim();
    if (!name) return null;
    const tagline = (input.tagline ?? "").trim();
    const entity: CustomEntity = {
      id: crypto.randomUUID(),
      name,
      tagline,
      createdAt: Date.now(),
    };
    setCustomEntities((prev) => [...prev, entity]);
    return entity;
  }, []);

  const updateEntity = useCallback(
    (id: string, input: { name: string; tagline: string }): boolean => {
      const name = input.name.trim();
      if (!name) return false;
      const tagline = input.tagline.trim();
      setCustomEntities((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, name, tagline } : e,
        ),
      );
      return true;
    },
    [],
  );

  const removeEntity = useCallback((id: string) => {
    setCustomEntities((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      customEntities,
      addEntity,
      updateEntity,
      removeEntity,
      hydrated,
    }),
    [customEntities, addEntity, updateEntity, removeEntity, hydrated],
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
