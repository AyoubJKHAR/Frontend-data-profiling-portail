import { createContext, useContext, useState } from 'react';
import  type { ReactNode } from 'react';
import type { AnalysisType } from '../types/Analysis';

type AnalysisContextType = {
  selectedType: AnalysisType;
  setSelectedType: (t: AnalysisType) => void;
  uploadedTableName?: string;
  setUploadedTableName: (n?: string) => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
  const [selectedType, setSelectedType] = useState<AnalysisType>('Profiling');
  const [uploadedTableName, setUploadedTableName] = useState<string | undefined>(undefined);

  return (
    <AnalysisContext.Provider
      value={{ selectedType, setSelectedType, uploadedTableName, setUploadedTableName }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider');
  return ctx;
};
