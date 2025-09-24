import type { LakehouseApi } from "../../../types/lakehouse";
import styles from "./ProfilingUpload.module.css";

interface Props {
  lakehouses: LakehouseApi[];
  loading: boolean;
  error: string | null;
  selectedId: string;
  setSelectedId: (id: string) => void;
  checkedTables: Set<string>;
  toggleTable: (t: string) => void;
  addTables: (current: LakehouseApi) => void;
  fetchLakehouses: () => void;
}

export default function LakehouseSelector({
  lakehouses, loading, error,
  selectedId, setSelectedId,
  checkedTables, toggleTable,
  addTables, fetchLakehouses
}: Props) {

  const current = lakehouses.find(l => l.idLakehouse === selectedId);

  return (
    <section className={styles.panel}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h2 className={styles.h2}>1. Choisir un lakehouse et ses tables</h2>
        <div style={{display:"flex",gap:8}}>
          <button className={styles.button} onClick={() => fetchLakehouses()} disabled={loading}>
            {loading ? "⏳" : "↻"} Rafraîchir
          </button>
          <button className={styles.button}
                  onClick={() => current && addTables(current)}
                  disabled={!current || checkedTables.size === 0}>
            ➕ Ajouter
          </button>
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}

      <div style={{display:"grid",gridTemplateColumns:"2fr 2fr",gap:16}}>
        <div className={styles.listBox}>
          <div className={styles.listHeader}>Lakehouses</div>
          <div className={styles.list}>
            {lakehouses.map(lh => (
              <div key={lh.idLakehouse}
                   className={`${styles.listItem} ${lh.idLakehouse===selectedId?styles.listItemActive:""}`}
                   onClick={() => setSelectedId(lh.idLakehouse)}>
                <input type="radio"
                       checked={lh.idLakehouse === selectedId}
                       onChange={() => setSelectedId(lh.idLakehouse)} />
                <span>{lh.lakehouseDisplayName}</span>
                <span style={{marginLeft:"auto",fontSize:12,opacity:0.8}}>
                  {lh.tables.length} table{lh.tables.length>1?"s":""}
                </span>
              </div>
            ))}
            {lakehouses.length===0 && !loading &&
              <div className={styles.listItem}>Aucun lakehouse.</div>}
          </div>
        </div>

        <div className={styles.listBox}>
          <div className={styles.listHeader}>
            {current ? `Tables — ${current.lakehouseDisplayName}` : "Tables"}
          </div>
          <div className={styles.list}>
            {!current ? (
              <div className={styles.listItem}>Sélectionnez un lakehouse.</div>
            ) : current.tables.length === 0 ? (
              <div className={styles.listItem}>Aucune table.</div>
            ) : current.tables.map(t => (
              <label key={t} className={styles.listItem}>
                <input type="checkbox"
                       checked={checkedTables.has(t)}
                       onChange={() => toggleTable(t)} />
                <span style={{flex:1}}>{t}</span>
                {checkedTables.has(t) && <span className={styles.pill}>✔</span>}
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
