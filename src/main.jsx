import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { applyTheme } from '@/lib/theme'

try {
  const __prefs = JSON.parse(localStorage.getItem('muse_accessibility') || '{}');
  if (__prefs.darkMode !== undefined) applyTheme(__prefs.darkMode);
  else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) applyTheme(true);
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
