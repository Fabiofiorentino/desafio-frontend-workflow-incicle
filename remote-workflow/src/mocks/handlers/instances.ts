import { http, HttpResponse } from 'msw'
import { instancesData } from '../data/instances'

export const instancesHandlers = [
  http.get('/api/instances/:id', ({ params }) => {
    const instance = instancesData.find(i => i.id === params.id)
    if (!instance) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(instance)
  }),

  http.post('/api/instances', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'inst-new', ...body as object }, { status: 201 })
  }),
]
