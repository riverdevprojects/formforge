import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import FormViewer from './pages/FormViewer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FormBuilder from './pages/FormBuilder.jsx';
import Confirmation from './pages/Confirmation.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/form/:slug" element={<FormViewer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<FormBuilder />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
