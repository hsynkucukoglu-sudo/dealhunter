import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ShoppingListProvider } from './context/ShoppingListContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShoppingListProvider>
      <App />
    </ShoppingListProvider>
  </React.StrictMode>,
)
