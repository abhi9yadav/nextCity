import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "./contexts/themeContext/ThemeProvider.jsx";
import '@fortawesome/fontawesome-free/css/all.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
