
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Index';
import WillCreatePage from '@/pages/will/WillCreatePage';
import TemplateWillCreationPage from '@/pages/will/TemplateWillCreationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/will/create" element={<WillCreatePage />} />
      <Route path="/will/template-creation/:templateId" element={<TemplateWillCreationPage />} />
    </Routes>
  );
}

export default App;
