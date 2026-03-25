export const instancesData = [
  {
    id: 'inst-1',
    templateName: 'Solicitação de Compra',
    templateVersion: '1.0',
    requester: 'João Silva',
    status: 'pending',
    steps: [
      { id: 's1', name: 'Revisão', status: 'approved', approver: 'Maria' },
      { id: 's2', name: 'Aprovação Financeira', status: 'pending', approver: 'Carlos' },
      { id: 's3', name: 'Diretoria', status: 'waiting', approver: 'Ana' },
    ],
    timeline: [
      { id: 'e1', event: 'Instância criada', author: 'João Silva', date: '2026-03-20T10:00:00Z' },
      { id: 'e2', event: 'Etapa "Revisão" aprovada', author: 'Maria', date: '2026-03-21T14:30:00Z' },
    ],
  },
]
