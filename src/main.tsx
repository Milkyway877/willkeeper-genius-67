
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mount the React application - no need for redirect logic here
// as it's now handled directly in index.html before the app loads
createRoot(document.getElementById("root")!).render(<App />);
