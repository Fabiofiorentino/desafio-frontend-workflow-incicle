import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Template, FieldDefinition } from '../mocks/data/templates'

function buildZodSchema(fields: FieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) {
    let schema: z.ZodTypeAny = z.string()
    if (field.type === 'number') schema = z.coerce.number()
    if (!field.required) schema = schema.optional()
    shape[field.name] = schema
  }
  return z.object(shape)
}

export default function NewInstance() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const schema = selectedTemplate ? buildZodSchema(selectedTemplate.fields) : z.object({})

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetch('/api/templates').then(r => r.json()).then(setTemplates)
  }, [])

  function handleTemplateChange(id: string) {
    const template = templates.find(t => t.id === id) ?? null
    setSelectedTemplate(template)
    // não usa reset() aqui para preservar campos em comum
  }

  async function onSubmit(data: Record<string, unknown>) {
    setSubmitted(true)
    await fetch('/api/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: selectedTemplate?.id, context: data }),
    })
    reset()
    setSelectedTemplate(null)
    setSubmitted(false)
    alert('Instância criada com sucesso!')
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Nova Instância</h1>

      <div>
        <label>Template</label>
        <select onChange={e => handleTemplateChange(e.target.value)} defaultValue="">
          <option value="" disabled>Selecione...</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name} v{t.version}</option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1rem' }}>
          {selectedTemplate.fields.map(field => (
            <div key={field.name} style={{ marginBottom: '0.75rem' }}>
              <label>{field.label}{field.required && ' *'}</label>
              {field.type === 'select' ? (
                <select {...register(field.name)}>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input type={field.type} {...register(field.name)} />
              )}
              {errors[field.name] && (
                <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                  {String(errors[field.name]?.message)}
                </span>
              )}
            </div>
          ))}
          <button type="submit" disabled={submitted}>
            {submitted ? 'Enviando...' : 'Criar Instância'}
          </button>
        </form>
      )}
    </div>
  )
}
