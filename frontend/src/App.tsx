import { Routes, Route, Navigate } from 'react-router';
import NavBar from './components/NavBar';
import Calendar from './pages/Calendar';
import StagingArea from './pages/StagingArea';
import Templates from './pages/Templates';
import './App.css';

export default function App() {
  return (
    <div className="root-layout">
      <NavBar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/staging" element={<StagingArea />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </main>
    </div>
  );
}
