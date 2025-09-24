import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../contexts/AnalysisContext';
import type { AnalysisType } from '../types/Analysis';
import AnalysisButton from './AnalysisButton';

const TYPES: AnalysisType[] = ['Profiling', 'Rules Generator', 'Code Generator'];

export default function Sidebar() {
  const { selectedType, setSelectedType } = useAnalysis();
  const navigate = useNavigate();

  const onSelect = (t: AnalysisType) => {
    setSelectedType(t);
    navigate('/upload');
  };

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '220px',
        height: '100vh',
        background: '#000',
        color: '#FFD700',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 10px',
        borderRight: '2px solid #FFD700',
      }}
    >
      {/* Logo */}
      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 30, textAlign: 'center' }}>
        GCC <br /> DataProfiler
      </div>

      {/* Boutons */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TYPES.map((t) => (
          <AnalysisButton
            key={t}
            label={t}
            active={selectedType === t}
            onClick={() => onSelect(t)}
          />
        ))}
      </nav>

      {/* Footer utilisateur */}
      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 14 }}>
        Utilisateur : <strong>Interne</strong>
      </div>
    </aside>
  );
}
