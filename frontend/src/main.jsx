import { StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './styles/index.scss';
import './i18n.js';
import App from './App.jsx'

// Отложенная загрузка icons и leaflet для уменьшения critical path
setTimeout(() => {
  import('./icons.js'); // FontAwesome icons library with Tree Shaking
  import('leaflet/dist/leaflet.css');
}, 100);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
