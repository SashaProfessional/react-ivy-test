import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { EmployeeTable } from './components/EmployeeTable'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmployeeTable />
  </StrictMode>,
)
