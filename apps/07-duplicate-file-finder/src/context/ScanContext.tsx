import React, { createContext, useContext, useState, useCallback } from "react";
import type { ScanFile, DuplicateGroup, CompareMode } from "../types";

interface ScanContextValue {
  files:       ScanFile[];
  groups:      DuplicateGroup[];
  compareMode: CompareMode | null;
  scannedAt:   string | null;
  setFiles:    (files: ScanFile[]) => void;
  setGroups:   (groups: DuplicateGroup[]) => void;
  setCompareMode: (m: CompareMode) => void;
  markScanned: () => void;
  reset:       () => void;
}

const Ctx = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [files,       setFiles]       = useState<ScanFile[]>([]);
  const [groups,      setGroups]      = useState<DuplicateGroup[]>([]);
  const [compareMode, setCompareMode] = useState<CompareMode | null>(null);
  const [scannedAt,   setScannedAt]   = useState<string | null>(null);

  const markScanned = useCallback(() => setScannedAt(new Date().toISOString()), []);
  const reset = useCallback(() => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]); setGroups([]); setCompareMode(null); setScannedAt(null);
  }, [files]);

  return (
    <Ctx.Provider value={{ files, groups, compareMode, scannedAt, setFiles, setGroups, setCompareMode, markScanned, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScan() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useScan must be inside ScanProvider");
  return ctx;
}
