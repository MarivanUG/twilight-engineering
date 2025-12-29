import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App' // FIX: Removed .tsx extension
import './index.css'
import { AdminProvider } from './contexts/AdminContext'

const queryClient = new QueryClient();

// FIX: Added '!' to assert that the root element exists
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminProvider>
          <App />
        </AdminProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)