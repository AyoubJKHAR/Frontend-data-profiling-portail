import React, { useRef } from 'react';

type Props = {
  disabled?: boolean;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
};

export default function FileUploadButton({ disabled, multiple = true, onFilesSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <>
      {/* Champ file caché */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv,application/json"
        multiple={multiple}
        onChange={handleChange}
      />

      {/* Bouton + stylisé */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: disabled ? '#444' : '#FFD700',
          color: disabled ? '#777' : '#000',
          fontSize: 28,
          fontWeight: 700,
          border: '2px solid #FFD700',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        +
      </button>
    </>
  );
}
