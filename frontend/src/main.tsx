import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ShoppingListProvider } from './context/ShoppingListContext'
import { LanguageProvider } from './context/LanguageContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <ShoppingListProvider>
        <App />
      </ShoppingListProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
