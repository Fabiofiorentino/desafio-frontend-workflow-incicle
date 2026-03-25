import { http, HttpResponse } from 'msw'
import { delegationsData, type Delegation } from '../data/delegations'

let delegations = [...delegationsData]

export const delegationsHandlers = [
  http.get('/api/delegations', () => {
    return HttpResponse.json(delegations.filter(d => d.active))
  }),

  http.post('/api/delegations', async ({ request }) => {
    const body = await request.json() as Omit<Delegation, 'id' | 'active'>
    // simula erro de ciclo em ~20% das vezes
    if (Math.random() < 0.2) {
      return HttpResponse.json(
        { message: 'Ciclo detectado', chain: ['Você', body.delegate, 'Carlos'] },
        { status: 422 }
      )
    }
    const newDelegation: Delegation = { id: `del-${Date.now()}`, active: true, ...body }
    delegations.push(newDelegation)
    return HttpResponse.json(newDelegation, { status: 201 })
  }),

  http.delete('/api/delegations/:id', ({ params }) => {
    delegations = delegations.map(d =>
      d.id === params.id ? { ...d, active: false } : d
    )
    return HttpResponse.json({ success: true })
  }),
]
