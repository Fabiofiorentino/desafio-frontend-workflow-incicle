import { useEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Approval } from '../mocks/data/approvals'
import { CheckCircle2, XCircle, AlertCircle, Clock, Building2 } from 'lucide-react'

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
    estimateSize: () => 100,
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
    <div className="max-w-6xl mx-2 p-6 font-sans text-slate-900">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox de Aprovações</h1>
          <p className="text-sm text-slate-500">{approvals.length} pendências aguardando sua ação</p>
        </div>
        <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
          Ambiente Multiempresa
        </div>
      </header>

      {notification && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <div 
        ref={parentRef} 
        className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-auto h-[75vh] scrollbar-thin scrollbar-thumb-slate-200"
      >
        <div 
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map(virtualItem => {
            const approval = approvals[virtualItem.index]
            if (!approval) return null

            const deadline = new Date(approval.slaDeadline)
            const msLeft = deadline.getTime() - Date.now()
            const hoursLeft = Math.floor(msLeft / 3600000)
            const isBreached = msLeft < 0
            const isWarning = !isBreached && hoursLeft < 4

            return (
              <div
                key={approval.id}
                className={`absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${
                  isBreached ? 'bg-red-50/40' : isWarning ? 'bg-amber-50/40' : 'bg-white'
                }`}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-900 leading-none">
                      {approval.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      {approval.currentStep}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} /> {approval.requester}
                    </span>
                    <span className={`flex items-center gap-1.5 font-medium ${
                      isBreached ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      <Clock size={12} />
                      {isBreached ? `Vencido há ${Math.abs(hoursLeft)}h` : `${hoursLeft}h restantes`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleReject(approval)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <XCircle size={18} />
                    Reprovar
                  </button>
                  <button 
                    onClick={() => handleApprove(approval)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    <CheckCircle2 size={18} />
                    Aprovar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
