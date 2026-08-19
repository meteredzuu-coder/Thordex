"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ComingSoonModal } from "@/components/ComingSoonModal";

type ComingSoonContextType = {
  openComingSoon: (label: string) => void;
};

const ComingSoonContext = createContext<ComingSoonContextType | null>(null);

export function useComingSoon() {
  const ctx = useContext(ComingSoonContext);
  if (!ctx) {
    throw new Error("useComingSoon harus dipakai di dalam AppProviders");
  }
  return ctx;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | null>(null);

  return (
    <ComingSoonContext.Provider value={{ openComingSoon: setLabel }}>
      {children}
      <ComingSoonModal label={label} onClose={() => setLabel(null)} />
    </ComingSoonContext.Provider>
  );
}
