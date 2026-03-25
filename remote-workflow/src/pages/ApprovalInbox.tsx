import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Approval } from '../mocks/data/approvals'

export default function ApprovalInbox() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/approvals/inbox')
      .then(r => r.json())
      .then(setApprovals)
  }, [])

  const virtualizer = useVirtualizer({
    count: approvals.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  })

  async function handleApprove(approval: Approval) {
    const previousApprovals = approvals
    // atualização otimista
    setApprovals(prev => prev.filter(a => a.id !== approval.id))

    const res = await fetch(`/api/approvals/${approval.id}/approve`, { method: 'POST' })

    if (res.status === 409) {
      // rollback + notificação
      setApprovals(previousApprovals)
      setNotification(`Conflito: outro aprovador já decidiu "${approval.title}"`)
      setTimeout(() => setNotification(null), 5000)
      return
    }

    if (!res.ok) {
      setApprovals(previousApprovals)
      setNotification('Erro ao aprovar. Tente novamente.')
      setTimeout(() => setNotification(null), 5000)
    }
  }

  async function handleReject(approval: Approval) {
    const previousApprovals = approvals
    setApprovals(prev => prev.filter(a => a.id !== approval.id))

    const res = await fetch(`/api/approvals/${approval.id}/reject`, { method: 'POST' })
    if (!res.ok) {
      setApprovals(previousApprovals)
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Inbox de Aprovações ({approvals.length})</h1>

      {notification && (
        <div style={{ background: '#fee2e2', border: '1px solid #f87171', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {notification}
        </div>
      )}

      <div ref={parentRef} style={{ height: '80vh', overflow: 'auto' }}>
        <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualizer.getVirtualItems().map(virtualItem => {
            const approval = approvals[virtualItem.index]
            const deadline = new Date(approval.slaDeadline)
            const msLeft = deadline.getTime() - Date.now()
            const hoursLeft = Math.floor(msLeft / 3600000)
            const isBreached = msLeft < 0
            const isWarning = !isBreached && hoursLeft < 4

            return (
              <div
                key={approval.id}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  left: 0,
                  right: 0,
                  height: virtualItem.size,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1rem',
                  borderBottom: '1px solid #e5e7eb',
                  background: isBreached ? '#fef2f2' : isWarning ? '#fffbeb' : '#fff',
                }}
              >
                <div>
                  <strong>{approval.title}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {approval.currentStep} · Solicitante: {approval.requester}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isBreached ? '#dc2626' : isWarning ? '#d97706' : '#6b7280' }}>
                    {isBreached ? `Vencido há ${Math.abs(hoursLeft)}h` : `SLA: ${hoursLeft}h restantes`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApprove(approval)}>Aprovar</button>
                  <button onClick={() => handleReject(approval)}>Reprovar</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
