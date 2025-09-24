import { useState } from "react";
import { CONFIG_URL, RUN_PIPELINE_URL } from "../services/api";
import type { SelectedLakehouse } from "../types/lakehouse";

export function useProfilingPipeline() {
  const [running, setRunning] = useState(false);
  const [runOk, setRunOk] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const runPipeline = async (selection: SelectedLakehouse[], clear: () => void) => {
    if (selection.length === 0) return;
    setRunning(true); setRunOk(false); setRunError(null);
    try {
      await fetch(CONFIG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTables: selection }),
      });
      await fetch(RUN_PIPELINE_URL, { method: "POST" });
      clear();
      setRunOk(true);
    } catch (e: any) {
      setRunError(e?.message || "Erreur inconnue");
    } finally {
      setRunning(false);
    }
  };

  return { running, runOk, runError, runPipeline };
}
