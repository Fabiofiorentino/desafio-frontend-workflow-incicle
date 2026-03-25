import { http, HttpResponse } from 'msw'
import { templatesData } from '../data/templates'

export const templatesHandlers = [
  http.get('/api/templates', () => {
    return HttpResponse.json(templatesData.filter(t => t.published))
  }),
]
