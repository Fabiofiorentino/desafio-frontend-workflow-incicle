/* eslint-disable no-self-assign */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ClipboardList, 
  Layers, 
  AlertCircle, 
  Send, 
  ChevronRight,
  Info
} from 'lucide-react'
import type { Template, FieldDefinition } from '../mocks/data/templates'

function buildZodSchema(fields: FieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    if (field.type === 'number') {
      schema = z.coerce.number({ message: "Deve ser um número válido" });
    } else {
      schema = z.string({ message: "Valor inválido" });
    }

    if (field.required) {
      if (field.type === 'number') {
        schema = schema; 
      } else {
        schema = (schema as z.ZodString).min(1, { message: "Campo obrigatório" });
      }
    } else {
      schema = schema.optional().or(z.literal('')); // Permite undefined ou string vazia
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

export default function NewInstance() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  }

  async function onSubmit(data: Record<string, unknown>) {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate?.id, context: data }),
      })
      
      if (res.ok) {
        reset()
        setSelectedTemplate(null)
        // Aqui você poderia usar um toast comercial, mas manteremos o fluxo
        alert('Instância criada com sucesso!')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-2 animate-in fade-in duration-500">
      {/* Header da Página */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-500">Nova Instância</h1>
          <p className="text-sm text-slate-500 font-medium">Inicie um novo fluxo de aprovação selecionando um template.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Lado Esquerdo: Seleção de Template */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Configuração Inicial
            </label>
            
            <div className="relative group">
              <Layers className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <select 
                onChange={e => handleTemplateChange(e.target.value)} 
                defaultValue=""
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none outline-none"
              >
                <option value="" disabled>Escolha um template...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                ))}
              </select>
            </div>

            {!selectedTemplate && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3 text-indigo-700">
                <Info size={18} className="shrink-0" />
                <p className="text-xs leading-relaxed italic">
                  Selecione um template para visualizar os campos de contexto necessários para o workflow.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Formulário Dinâmico */}
        <div className="md:col-span-8">
          {selectedTemplate ? (
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
            >
              <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Campos do Workflow</span>
                <span className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 font-mono text-slate-500 uppercase font-bold">
                  {selectedTemplate.fields.length} campos requeridos
                </span>
              </div>

              <div className="p-8 space-y-6">
                {selectedTemplate.fields.map(field => (
                  <div key={field.name} className="space-y-1.5 group">
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 group-focus-within:text-indigo-600 transition-colors">
                      {field.label}
                      {field.required && <span className="text-red-400 text-xs">*</span>}
                    </label>

                    <div className="relative">
                      {field.type === 'select' ? (
                        <select 
                          {...register(field.name)}
                          className={`w-full px-4 py-2.5 bg-white border ${errors[field.name] ? 'border-red-300' : 'border-slate-200'} rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none`}
                        >
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input 
                          type={field.type} 
                          {...register(field.name)} 
                          placeholder={`Digite o valor para ${field.label.toLowerCase()}`}
                          className={`w-full px-4 py-2.5 bg-white border ${errors[field.name] ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'} rounded-lg text-sm focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300`}
                        />
                      )}
                    </div>

                    {errors[field.name] && (
                      <div className="flex items-center gap-1 text-red-500 animate-in slide-in-from-left-2">
                        <AlertCircle size={12} />
                        <span className="text-[11px] font-medium">
                          {String(errors[field.name]?.message)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    'Processando...'
                  ) : (
                    <>
                      Criar Instância
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full min-h-75 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Send size={32} className="opacity-20" />
              </div>
              <p className="font-medium">Nenhum template selecionado</p>
              <p className="text-xs max-w-50">Escolha um modelo ao lado para começar a preencher os dados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
