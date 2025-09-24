import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnalysisProvider } from './contexts/AnalysisContext';
import Sidebar from './components/Sidebar';
import Upload from './pages/Upload';
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter basename="/Frontend-data-profiling-portail">
      <AnalysisProvider>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ marginLeft: '220px', padding: '20px', width: '100%' }}>
            <Routes>
              <Route path="/upload" element={<Upload />} />
              <Route path="/" element={<Upload />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AnalysisProvider>
    </BrowserRouter>
  );
}
