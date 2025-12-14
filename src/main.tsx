import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // FIX: Removed .tsx extension
import './index.css'

// FIX: Added '!' to assert that the root element exists
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)