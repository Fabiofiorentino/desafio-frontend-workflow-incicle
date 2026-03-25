import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function InstanceDetail() {
  const { id } = useParams()
  const [instance, setInstance] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch(`/api/instances/${id}`)
      .then(r => r.json())
      .then(setInstance)
  }, [id])

  if (!instance) return <div>Carregando...</div>

  const steps = instance.steps as Array<{ id: string; name: string; status: string; approver: string }>
  const timeline = instance.timeline as Array<{ id: string; event: string; author: string; date: string }>

  const stepColors: Record<string, string> = {
    approved: '#dcfce7',
    rejected: '#fee2e2',
    pending: '#fef9c3',
    waiting: '#f3f4f6',
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Instância: {String(instance.templateName)}</h1>
      <p>Versão: {String(instance.templateVersion)} · Solicitante: {String(instance.requester)} · Status: {String(instance.status)}</p>

      <h2>Etapas</h2>
      {steps.map(step => (
        <div key={step.id} style={{ padding: '0.5rem', marginBottom: '0.5rem', background: stepColors[step.status] ?? '#fff', borderRadius: '4px' }}>
          <strong>{step.name}</strong> — {step.status} · Aprovador: {step.approver}
        </div>
      ))}

      <h2>Timeline</h2>
      {timeline.map(event => (
        <div key={event.id} style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: '1rem', marginBottom: '0.75rem' }}>
          <div>{event.event}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{event.author} · {new Date(event.date).toLocaleString('pt-BR')}</div>
        </div>
      ))}
    </div>
  )
}