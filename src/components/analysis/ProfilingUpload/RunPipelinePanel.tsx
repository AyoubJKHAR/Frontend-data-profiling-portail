import styles from "./ProfilingUpload.module.css";
import type { SelectedLakehouse } from "../../../types/lakehouse";

export default function RunPipelinePanel({
  selection,
  running,
  runOk,
  runError,
  handleRun
}: {
  selection: SelectedLakehouse[];
  running: boolean;
  runOk: boolean;
  runError: string | null;
  handleRun: () => void;
}) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.h2}>3. Lancer le profiling</h2>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <button className={styles.button}
                onClick={handleRun}
                disabled={selection.length === 0 || running}>
          {running ? "⏳ Envoi…" : "🚀 Lancer"}
        </button>
        {runOk   && <span className={styles.success}>✔ Profiling configuré et pipeline déclenchée</span>}
        {runError && <span className={styles.error}>✖ {runError}</span>}
      </div>
    </section>
  );
}
