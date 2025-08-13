import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

export const server = "http://localhost:5000";

createRoot(document.getElementById("root")!).render(<App />);
