type Props = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

export default function AnalysisButton({ label, active = false, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px',
        borderRadius: 6,
        border: 'none',
        background: active ? '#FFD700' : 'transparent',
        color: active ? '#000' : '#FFD700',
        fontWeight: 600,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      {label}
    </button>
  );
}
