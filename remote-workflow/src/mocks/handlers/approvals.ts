import { http, HttpResponse } from 'msw'
import { approvalsData } from '../data/approvals'

// cópia mutável para simular estado
let approvals = [...approvalsData]

export const approvalsHandlers = [
  http.get('/api/approvals/inbox', () => {
    return HttpResponse.json(approvals.filter(a => a.status === 'pending'))
  }),

  http.post('/api/approvals/:id/approve', ({ params }) => {
    // simula 409 aleatório em ~20% das vezes
    if (Math.random() < 0.2) {
      return HttpResponse.json(
        { message: 'Outro aprovador já decidiu esta etapa.' },
        { status: 409 }
      )
    }
    approvals = approvals.map(a =>
      a.id === params.id ? { ...a, status: 'approved' } : a
    )
    return HttpResponse.json({ success: true })
  }),

  http.post('/api/approvals/:id/reject', ({ params }) => {
    approvals = approvals.map(a =>
      a.id === params.id ? { ...a, status: 'rejected' } : a
    )
    return HttpResponse.json({ success: true })
  }),
]
