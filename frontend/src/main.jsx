import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'  // Make sure this is imported
import { store } from './store/store'   // Make sure this path is correct
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>   {/* This MUST wrap App */}
      <App />
    </Provider>
  </StrictMode>,
)