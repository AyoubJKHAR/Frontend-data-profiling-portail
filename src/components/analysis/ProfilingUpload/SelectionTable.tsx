import type { SelectedTable } from "../../../types/lakehouse";
import styles from "./ProfilingUpload.module.css";

interface Row { lakehouse: string; table: SelectedTable; }

export default function SelectionTable({
  rows,
  updateProjectName,
  removeTable
}: {
  rows: Row[];
  updateProjectName: (lh: string, table: string, v: string) => void;
  removeTable: (lh: string, table: string) => void;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.h2}>2. Sélection(s) — Profiling</h2>
      {rows.length === 0 ? (
        <p style={{opacity:0.8}}>Aucune sélection.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Lakehouse</th>
              <th className={styles.th}>Table</th>
              <th className={styles.th}>Nom du projet</th>
              <th className={styles.th}>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={`${r.lakehouse}-${r.table.name}-${i}`}>
                <td className={styles.td}>{r.lakehouse}</td>
                <td className={styles.td}>{r.table.name}</td>
                <td className={styles.td}>
                  <input className={styles.input}
                         value={r.table.projectName}
                         onChange={e => updateProjectName(r.lakehouse, r.table.name, e.target.value)}
                         placeholder="optionnel" />
                </td>
                <td className={styles.td}>
                  <button className={styles.button}
                          onClick={() => removeTable(r.lakehouse, r.table.name)}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
