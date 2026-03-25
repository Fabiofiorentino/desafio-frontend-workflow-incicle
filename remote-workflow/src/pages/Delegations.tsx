import { useEffect, useState } from 'react'
import type { Delegation } from '../mocks/data/delegations'

export default function Delegations() {
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [cycleChain, setCycleChain] = useState<string[] | null>(null)
  const [delegate, setDelegate] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    fetch('/api/delegations').then(r => r.json()).then(setDelegations)
  }, [])

  async function handleCreate() {
    setCycleChain(null)
    const res = await fetch('/api/delegations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delegate, from, to }),
    })

    if (res.status === 422) {
      const data = await res.json()
      setCycleChain(data.chain)
      return
    }

    const created = await res.json()
    setDelegations(prev => [...prev, created])
    setDelegate(''); setFrom(''); setTo('')
  }

  async function handleCancel(id: string) {
    await fetch(`/api/delegations/${id}`, { method: 'DELETE' })
    setDelegations(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Delegações</h1>

      <h2>Nova Delegação</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px' }}>
        <input placeholder="Delegado" value={delegate} onChange={e => setDelegate(e.target.value)} />
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        <button onClick={handleCreate}>Criar</button>
      </div>

      {cycleChain && (
        <div style={{ background: '#fef2f2', border: '1px solid #f87171', padding: '0.75rem', marginTop: '1rem', borderRadius: '4px' }}>
          <strong>Ciclo detectado:</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            {cycleChain.map((name, i) => (
              <span key={i}>
                <span style={{ background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{name}</span>
                {i < cycleChain.length - 1 && <span> → </span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <h2>Delegações Ativas</h2>
      {delegations.map(d => (
        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <span>{d.delegate} · {d.from} até {d.to}</span>
          <button onClick={() => handleCancel(d.id)}>Cancelar</button>
        </div>
      ))}
    </div>
  )
}
