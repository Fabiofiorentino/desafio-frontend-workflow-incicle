import './index.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { startMocks } from './mocks'
import App from './App'

startMocks().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
