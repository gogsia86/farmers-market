/**
 * ⚡ QUANTUM CONTEXT
 * Global quantum state management for agricultural consciousness
 */
"use client";

import { createContext, ReactNode, useContext, useState, useCallback } from "react";

interface QuantumState {
  season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
  consciousness: "GROWING" | "HARVESTING" | "DORMANT" | "FLOWING";
  agriculturalMode: boolean;
}

interface QuantumContextValue {
  state: QuantumState;
  updateSeason: (season: QuantumState["season"]) => void;
  updateConsciousness: (consciousness: QuantumState["consciousness"]) => void;
  toggleAgriculturalMode: () => void;
}

const QuantumContext = createContext<QuantumContextValue | undefined>(
  undefined,
);

export function QuantumProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuantumState>({
    season: "SUMMER",
    consciousness: "GROWING",
    agriculturalMode: true,
  });

  const updateSeason = useCallback((season: QuantumState["season"]) => {
    setState(prev => ({ ...prev, season }));
  }, []);

  const updateConsciousness = useCallback((consciousness: QuantumState["consciousness"]) => {
    setState(prev => ({ ...prev, consciousness }));
  }, []);

  const toggleAgriculturalMode = useCallback(() => {
    setState(prev => ({ ...prev, agriculturalMode: !prev.agriculturalMode }));
  }, []);

  const value: QuantumContextValue = {
    state,
    updateSeason,
    updateConsciousness,
    toggleAgriculturalMode,
  };

  return (
    <QuantumContext.Provider value={value}>{children}</QuantumContext.Provider>
  );
}

export function useQuantum() {
  const context = useContext(QuantumContext);
  if (context === undefined) {
    throw new Error("useQuantum must be used within a QuantumProvider");
  }
  return context;
}
