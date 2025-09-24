import React, { useEffect, useMemo, useState } from "react";

interface LakehouseApi {
  idLakehouse: string;
  lakehouseDisplayName: string;
  tables: string[];
}

interface SelectedTable {
  name: string;
  projectName: string;
}

// clé renommée : lakehouseName
interface SelectedLakehouse {
  lakehouseName: string;
  tables: SelectedTable[];
  idLakehouse : string,
}

const API_BASE = "http://localhost:3000";
const BACKEND_URL = `${API_BASE}/lakehouses-with-tables`;
const CONFIG_URL = `${API_BASE}/add_selected_lakehouses_tables_to_config`;
const RUN_PIPELINE_URL = `${API_BASE}/run-pipeline`;


const S = {
  panel: (active = true): React.CSSProperties => ({
    padding: 20,
    border: "2px solid #FFD700",
    borderRadius: 8,
    background: active ? "#111" : "#222",
    color: "#FFD700",
  }),
  h2: { marginTop: 0 },
  button: (enabled = true): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #FFD700",
    background: enabled ? "#FFD700" : "#555",
    color: enabled ? "#000" : "#ddd",
    fontWeight: 700,
    cursor: enabled ? "pointer" : "not-allowed",
  }),
  listBox: {
    border: "1px solid #FFD700",
    borderRadius: 8,
    overflow: "hidden",
  } as React.CSSProperties,
  listHeader: {
    padding: "10px 12px",
    borderBottom: "1px solid #FFD700",
    background: "#000",
    color: "#FFD700",
    fontWeight: 700,
  },
  list: {
    maxHeight: 260,
    overflowY: "auto",
    background: "#000",
  } as React.CSSProperties,
  listItem: (active = false): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid #333",
    background: active ? "#1a1a1a" : "transparent",
    cursor: "pointer",
  }),
  pill: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    border: "1px solid #FFD700",
    borderRadius: 999,
    padding: "4px 8px",
    fontSize: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#000",
    color: "#FFD700",
  } as React.CSSProperties,
  th: { padding: 8, textAlign: "left", borderBottom: "2px solid #FFD700" },
  td: { padding: 8, borderBottom: "1px solid #444", verticalAlign: "middle" },
  input: {
    padding: "4px 6px",
    background: "#111",
    color: "#FFD700",
    border: "1px solid #FFD700",
    borderRadius: 4,
    width: "100%",
  } as React.CSSProperties,
};

export default function ProfilingUpload() {
  const [lakehouses, setLakehouses] = useState<LakehouseApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedLakehouseId, setSelectedLakehouseId] = useState<string>("");
  const [selection, setSelection] = useState<SelectedLakehouse[]>([]);
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());

  // récupération des lakehouses
  const fetchLakehouses = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(BACKEND_URL, { signal });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as LakehouseApi[];
      setLakehouses(data);
      localStorage.setItem(
        "lakehouses_cache",
        JSON.stringify({ ts: Date.now(), data })
      );
    } catch (e: any) {
      const cachedRaw = localStorage.getItem("lakehouses_cache");
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (Array.isArray(cached?.data)) {
            setLakehouses(cached.data as LakehouseApi[]);
            setError("Backend indisponible — cache utilisé.");
          } else throw e;
        } catch {
          setError(e?.message || "Impossible de récupérer les lakehouses.");
        }
      } else setError(e?.message || "Impossible de récupérer les lakehouses.");
    } finally {
      setLoading(false);
      setSelection([])
    }
  };

  useEffect(() => {
    const ctrl = new AbortController();
    fetchLakehouses(ctrl.signal);
    return () => ctrl.abort();
  }, []);


  const currentLakehouse = useMemo(
    () => lakehouses.find((l) => l.idLakehouse === selectedLakehouseId) || null,
    [lakehouses, selectedLakehouseId]
  );

  // pré-cocher les tables déjà choisies
  useEffect(() => {
    if (!currentLakehouse) return;
    const already = selection.find(
      (s) => s.lakehouseName === currentLakehouse.lakehouseDisplayName
    );
    setCheckedTables(new Set(already ? already.tables.map((t) => t.name) : []));
  }, [currentLakehouse, selection]);

  const flatRows = useMemo(() => {
    const rows: Array<{ lakehouse: string; table: SelectedTable }> = [];
    selection.forEach((lh) =>
      lh.tables.forEach((t) =>
        rows.push({ lakehouse: lh.lakehouseName, table: t })
      )
    );
    return rows;
  }, [selection]);

  const toggleTable = (t: string) => {
    setCheckedTables((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const handleAdd = () => {
    if (!currentLakehouse || checkedTables.size === 0) return;
    const name = currentLakehouse.lakehouseDisplayName;
    const idLakehouse = currentLakehouse.idLakehouse;

    const toAdd = Array.from(checkedTables).map((t) => ({
      name: t,
      projectName: "",
    }));

    setSelection((prev) => {
      const idx = prev.findIndex((x) => x.lakehouseName === name);
      if (idx >= 0) {
        const existing = new Set(prev[idx].tables.map((t) => t.name));
        const merged = [...prev[idx].tables];
        toAdd.forEach((t) => {
          if (!existing.has(t.name)) merged.push(t);
        });
        const clone = [...prev];
        clone[idx] = { ...clone[idx], idLakehouse, tables: merged };
        return clone;
      }
      return [...prev, { lakehouseName: name, idLakehouse, tables: toAdd }];
    });
    
    // pour masqué le message 
    setRunOk(false);
  };

  const updateProjectName = (
    lhName: string,
    tableName: string,
    value: string
  ) => {
    setSelection((prev) =>
      prev.map((lh) =>
        lh.lakehouseName === lhName
          ? {
              ...lh,
              tables: lh.tables.map((t) =>
                t.name === tableName ? { ...t, projectName: value } : t
              ),
            }
          : lh
      )
    );
  };

  const removeTable = (lhName: string, tableName: string) => {
    setSelection((prev) =>
      prev
        .map((lh) =>
          lh.lakehouseName === lhName
            ? { ...lh, tables: lh.tables.filter((t) => t.name !== tableName) }
            : lh
        )
        .filter((lh) => lh.tables.length > 0)
    );
  };

  // État du run et de la pipeline
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runOk, setRunOk] = useState(false);
  // const [pipelineMsg, setPipelineMsg] = useState<string | null>(null);

  const handleRun = async () => {
    if (selection.length === 0) return;
    setRunning(true);
    setRunOk(false);
    setRunError(null);
    // setPipelineMsg(null);
    try {
      const payload = { selectedTables: selection };
      const res = await fetch(CONFIG_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Échec enregistrement config : HTTP ${res.status}`);
      await res.json().catch(() => ({}));

      const pRes = await fetch(RUN_PIPELINE_URL, { method: "POST" });
      if (!pRes.ok) throw new Error(`Échec lancement pipeline : HTTP ${pRes.status}`);
      // const pData = await pRes.json();
      // setPipelineMsg(`Pipeline lancé avec l'ID ${pData.jobInstanceId}`);
      // pour afficher etat de

      setSelection([]);
      setRunOk(true);
    } catch (e: any) {
      setRunError(e?.message || "Erreur inconnue");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Sélection des lakehouses/tables */}
      <section style={S.panel()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h2 style={S.h2}>1. Choisir un lakehouse et ses tables</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => fetchLakehouses()}
              style={S.button(!loading)}
              disabled={loading}
            >
              {loading ? "⏳" : "↻"} Rafraîchir
            </button>
            <button
              onClick={handleAdd}
              style={S.button(!!currentLakehouse && checkedTables.size > 0)}
              disabled={!currentLakehouse || checkedTables.size === 0}
            >
              ➕ Ajouter
            </button>
          </div>
        </div>

        {error && <p style={{ color: "#ff7b7b" }}>{error}</p>}
        
        {/* Liste des Lakehouses */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr", gap: 16 }}>
          <div style={S.listBox}>
            <div style={S.listHeader}>Lakehouses</div>
            <div style={S.list}>
              {lakehouses.map((lh) => (
                <div
                  key={lh.idLakehouse}
                  style={S.listItem(lh.idLakehouse === selectedLakehouseId)}
                  onClick={() => setSelectedLakehouseId(lh.idLakehouse)}
                >
                  <input
                    type="radio"
                    checked={lh.idLakehouse === selectedLakehouseId}
                    onChange={() => setSelectedLakehouseId(lh.idLakehouse)}
                  />
                  <span>{lh.lakehouseDisplayName}</span>
                  <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
                    {lh.tables.length} table{lh.tables.length > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
              {lakehouses.length === 0 && !loading && (
                <div style={{ padding: 12, opacity: 0.8 }}>Aucun lakehouse.</div>
              )}
            </div>
          </div>
            
          {/* LISTE DES TABLES DE LAKEHOUSE SELECTIONNE */}
          <div style={S.listBox}>
            <div style={S.listHeader}>
              {currentLakehouse
                ? `Tables — ${currentLakehouse.lakehouseDisplayName}`
                : "Tables"}
            </div>
            <div style={S.list}>
              {!currentLakehouse ? (
                <div style={{ padding: 12, opacity: 0.8 }}>
                  Sélectionnez un lakehouse.
                </div>
              ) : currentLakehouse.tables.length === 0 ? (
                <div style={{ padding: 12, opacity: 0.8 }}>Aucune table.</div>
              ) : (
                currentLakehouse.tables.map((t) => (
                  <label key={t} style={S.listItem(false)}>
                    <input
                      type="checkbox"
                      checked={checkedTables.has(t)}
                      onChange={() => toggleTable(t)}
                    />
                    <span style={{ flex: 1 }}>{t}</span>
                    {checkedTables.has(t) && <span style={S.pill}>✔</span>}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Récapitulatif */}
      <section style={{ ...S.panel(), marginTop: 30 }}>
        <h2 style={S.h2}>2. Sélection(s) — Profiling</h2>
        {flatRows.length === 0 ? (
          <p style={{ opacity: 0.8 }}>Aucune sélection.</p>
        ) : (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Lakehouse</th>
                <th style={S.th}>Table</th>
                <th style={S.th}>Nom du projet</th>
                <th style={S.th}>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {flatRows.map((r, i) => (
                <tr key={`${r.lakehouse}-${r.table.name}-${i}`}>
                  <td style={S.td}>{r.lakehouse}</td>
                  <td style={S.td}>{r.table.name}</td>
                  <td style={S.td}>
                    <input
                      style={S.input}
                      value={r.table.projectName}
                      onChange={(e) =>
                        updateProjectName(
                          r.lakehouse,
                          r.table.name,
                          e.target.value
                        )
                      }
                      placeholder="optionnel"
                    />
                  </td>
                  <td style={S.td}>
                    <button
                      style={S.button(true)}
                      onClick={() => removeTable(r.lakehouse, r.table.name)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Lancer le profiling + pipeline */}
      <section style={{ ...S.panel(), marginTop: 20 }}>
        <h2 style={S.h2}>3. Lancer le profiling</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={handleRun}
            style={S.button(selection.length > 0 && !running)}
            disabled={selection.length === 0 || running}
          >
            {running ? "⏳ Envoi…" : "🚀 Lancer"}
          </button>
          {runOk && (
            <span style={{ color: "#9AE6B4" }}>
              ✔ Profiling configuré et pipeline déclenchée
            </span>
          )}
          {/* {pipelineMsg && (
            <span style={{ color: "#9AE6B4" }}>{pipelineMsg}</span>
          )} */}
          {runError && <span style={{ color: "#ff7b7b" }}>✖ {runError}</span>}
        </div>
      </section>
    </div>
  );
}
