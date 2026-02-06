import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Enable proxy by default if not already set
if (!localStorage.getItem('useProxy')) {
  localStorage.setItem('useProxy', 'true');
  console.log('✓ Proxy mode enabled by default to bypass CORS');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
