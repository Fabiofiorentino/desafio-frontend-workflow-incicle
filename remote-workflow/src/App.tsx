import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const ApprovalInbox = lazy(() => import('./pages/ApprovalInbox'))
const InstanceDetail = lazy(() => import('./pages/InstanceDetail'))
const NewInstance = lazy(() => import('./pages/NewInstance'))
const Delegations = lazy(() => import('./pages/Delegations'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/approvals/inbox" replace />} />
          <Route path="/approvals/inbox" element={<ApprovalInbox />} />
          <Route path="/instances/new" element={<NewInstance />} />
          <Route path="/instances/:id" element={<InstanceDetail />} />
          <Route path="/delegations" element={<Delegations />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
