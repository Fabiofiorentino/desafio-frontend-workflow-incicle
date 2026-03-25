export type Delegation = {
  id: string
  delegate: string
  from: string
  to: string
  active: boolean
}

export const delegationsData: Delegation[] = [
  {
    id: 'del-1',
    delegate: 'Carlos Souza',
    from: '2026-03-01',
    to: '2026-03-31',
    active: true,
  },
]
