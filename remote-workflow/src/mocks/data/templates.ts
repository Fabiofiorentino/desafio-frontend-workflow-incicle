export type FieldDefinition = {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select'
  required: boolean
  options?: string[] // só para type 'select'
}

export type Template = {
  id: string
  name: string
  version: string
  published: boolean
  fields: FieldDefinition[]
}

export const templatesData: Template[] = [
  {
    id: 'template-1',
    name: 'Solicitação de Compra',
    version: '1.0',
    published: true,
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'amount', label: 'Valor', type: 'number', required: true },
      { name: 'deadline', label: 'Prazo', type: 'date', required: false },
    ],
  },
  {
    id: 'template-2',
    name: 'Solicitação de Férias',
    version: '2.1',
    published: true,
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
      { name: 'startDate', label: 'Data de início', type: 'date', required: true },
      { name: 'days', label: 'Quantidade de dias', type: 'number', required: true },
      {
        name: 'type',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: ['Férias', 'Licença', 'Abono'],
      },
    ],
  },
  // Não publicado
  {
    id: 'template-3',
    name: 'Contratação de Fornecedor',
    version: '1.2',
    published: false,
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true },
    ],
  },
]
