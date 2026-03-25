export type Approval = {
  id: string
  title: string
  currentStep: string
  requester: string
  slaDeadline: string 
  status: 'pending' | 'approved' | 'rejected'
}

function randomDate(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600 * 1000).toISOString()
}

export const approvalsData: Approval[] = Array.from({ length: 10000 }, (_, i) => ({
  id: `approval-${i + 1}`,
  title: `Solicitação #${i + 1}`,
  currentStep: `Etapa ${(i % 3) + 1}`,
  requester: `Usuário ${(i % 50) + 1}`,
  slaDeadline: randomDate(i % 48 - 24), 
  status: 'pending',
}))
