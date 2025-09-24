import { useState, useMemo } from "react";
import type { SelectedLakehouse, SelectedTable, LakehouseApi } from "../types/lakehouse";

export function useLakehouseSelection() {
  const [selectedLakehouseId, setSelectedLakehouseId] = useState<string>("");
  const [selection, setSelection] = useState<SelectedLakehouse[]>([]);
  const [checkedTables, setCheckedTables] = useState<Set<string>>(new Set());

  const flatRows = useMemo(() => {
    const rows: Array<{ lakehouse: string; table: SelectedTable }> = [];
    selection.forEach(lh => lh.tables.forEach(t => rows.push({ lakehouse: lh.lakehouseName, table: t })));
    return rows;
  }, [selection]);

  const toggleTable = (t: string) =>
    setCheckedTables(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const addTables = (current: LakehouseApi) => {
    if (!current || checkedTables.size === 0) return;
    const name = current.lakehouseDisplayName;
    const id = current.idLakehouse;
    const toAdd = Array.from(checkedTables).map(t => ({ name: t, projectName: "" }));
    setSelection(prev => {
      const idx = prev.findIndex(x => x.lakehouseName === name);
      if (idx >= 0) {
        const existing = new Set(prev[idx].tables.map(t => t.name));
        const merged = [...prev[idx].tables];
        toAdd.forEach(t => { if (!existing.has(t.name)) merged.push(t); });
        const clone = [...prev];
        clone[idx] = { ...clone[idx], tables: merged };
        return clone;
      }
      return [...prev, { lakehouseName: name, idLakehouse: id, tables: toAdd }];
    });
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
        .map(s => s.lakehouseName === lh
          ? { ...s, tables: s.tables.filter(t => t.name !== table) }
          : s
        )
        .filter(s => s.tables.length > 0)
    );

  return {
    selectedLakehouseId, setSelectedLakehouseId,
    selection, setSelection,
    checkedTables, setCheckedTables,
    flatRows, toggleTable, addTables,
    updateProjectName, removeTable
  };
}
