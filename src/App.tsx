
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import './MobileStyles.css';
import Dashboard from './pages/dashboard/Dashboard';
import { default as Home } from './pages/Index';
import Settings from './pages/settings/Settings';
import Confirm from './pages/Confirm';
import CheckIn from './pages/CheckIn';
import AccessWill from './pages/AccessWill';

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/decline" element={<Confirm />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/access-will" element={<AccessWill />} />
      </Routes>
    </Router>
  );
}

export default App;
