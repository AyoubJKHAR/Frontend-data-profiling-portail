import React, { useEffect, useMemo, useState } from "react";
import styles from "./ProfilingUpload.module.css";
import type { LakehouseApi, SelectedLakehouse, SelectedTable } from "../../../types/lakehouse";
import { BACKEND_URL, CONFIG_URL, RUN_PIPELINE_URL } from "../../../services/api";
import LakehouseSelector from "./LakehouseSelector";
import SelectionTable from "./SelectionTable";
import RunPipelinePanel from "./RunPipelinePanel";

export default function ProfilingUpload() {
  const [lakehouses, setLakehouses] = useState<LakehouseApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLakehouseId, setSelectedLakehouseId] = useState("");
  const [selection, setSelection] = useState<SelectedLakehouse[]>([]);
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());

  // fetch lakehouses
  const fetchLakehouses = async (signal?: AbortSignal) => {
    setLoading(true); setError(null);
    try {
      setError("fetch .....");
      const r = await fetch(BACKEND_URL, { signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as LakehouseApi[];
      setLakehouses(data);
      setError(null)
      // utilisation de cache en cas de besoin
      // localStorage.setItem("lakehouses_cache", JSON.stringify({ ts: Date.now(), data }));
    } catch (e: any) {
      setError("Backend indisponible — refresh");
      // const cachedRaw = localStorage.getItem("lakehouses_cache");
      // if (cachedRaw) {
      //   const cached = JSON.parse(cachedRaw);
      //   if (Array.isArray(cached?.data)) {
      //     setLakehouses(cached.data);
      //     setError("Backend indisponible — cache utilisé.");
      //   } else setError(e?.message);
      // } elsesetError(e?.message);
    } finally {
      setLoading(false);
      setSelection([]);
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchLakehouses(ctrl.signal);
    return () => ctrl.abort();
  }, []);

  const currentLakehouse = useMemo(
    () => lakehouses.find(l => l.idLakehouse === selectedLakehouseId) || null,
    [lakehouses, selectedLakehouseId]
  );

  useEffect(() => {
    if (!currentLakehouse) return;
    const already = selection.find(
      s => s.lakehouseName === currentLakehouse.lakehouseDisplayName
    );
    setCheckedTables(new Set(already ? already.tables.map(t => t.name) : []));
  }, [currentLakehouse, selection]);

  const flatRows = useMemo(() => {
    const rows: Array<{ lakehouse: string; table: SelectedTable }> = [];
    selection.forEach(lh =>
      lh.tables.forEach(t => rows.push({ lakehouse: lh.lakehouseName, table: t }))
    );
    return rows;
  }, [selection]);

  const toggleTable = (t: string) => {
    setCheckedTables(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const addTables = (current: LakehouseApi) => {
    const name = current.lakehouseDisplayName;
    const id   = current.idLakehouse;
    const toAdd = Array.from(checkedTables).map(t => ({ name: t, projectName: "" }));

    setSelection(prev => {
      const idx = prev.findIndex(x => x.lakehouseName === name);
      if (idx >= 0) {
        const existing = new Set(prev[idx].tables.map(t => t.name));
        const merged = [...prev[idx].tables];
        toAdd.forEach(t => { if (!existing.has(t.name)) merged.push(t); });
        const clone = [...prev];
        clone[idx] = { ...clone[idx], idLakehouse: id, tables: merged };
        return clone;
      }
      return [...prev, { lakehouseName: name, idLakehouse: id, tables: toAdd }];
    });
    setRunOk(false);
  };

  const updateProjectName = (lh: string, table: string, value: string) =>
    setSelection(prev =>
      prev.map(s =>
        s.lakehouseName === lh
          ? { ...s, tables: s.tables.map(t => t.name === table ? { ...t, projectName: value } : t) }
          : s
      )
    );

  const removeTable = (lh: string, table: string) =>
    setSelection(prev =>
      prev
        .map(s =>
          s.lakehouseName === lh
            ? { ...s, tables: s.tables.filter(t => t.name !== table) }
            : s
        )
        .filter(s => s.tables.length > 0)
    );

  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runOk, setRunOk] = useState(false);

  const handleRun = async () => {
    if (selection.length === 0) return;
    setRunning(true); setRunOk(false); setRunError(null);
    try {
      await fetch(CONFIG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTables: selection }),
      });
      const pRes = await fetch(RUN_PIPELINE_URL, { method: "POST" });
      if (!pRes.ok) throw new Error(`Échec lancement pipeline : HTTP ${pRes.status}`);
      setSelection([]);
      setRunOk(true);
    } catch (e: any) {
      setRunError(e?.message || "Erreur inconnue");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className={styles.container}>
      <LakehouseSelector
        lakehouses={lakehouses}
        loading={loading}
        error={error}
        selectedId={selectedLakehouseId}
        setSelectedId={setSelectedLakehouseId}
        checkedTables={checkedTables}
        toggleTable={toggleTable}
        addTables={addTables}
        fetchLakehouses={fetchLakehouses}
      />

      <SelectionTable
        rows={flatRows}
        updateProjectName={updateProjectName}
        removeTable={removeTable}
      />

      <RunPipelinePanel
        selection={selection}
        running={running}
        runOk={runOk}
        runError={runError}
        handleRun={handleRun}
      />
    </div>
  );
}
