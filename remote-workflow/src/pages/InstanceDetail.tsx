/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  User, 
  Calendar, 
  ArrowLeft,
  FileText,
  Activity,
  CheckSquare
} from 'lucide-react'

// Tipagem básica para auxílio do TS
interface Step { id: string; name: string; status: 'approved' | 'rejected' | 'pending' | 'waiting'; approver: string }
interface TimelineEvent { id: string; event: string; author: string; date: string }
interface InstanceData {
  templateName: string;
  templateVersion: string;
  requester: string;
  status: string;
  steps: Step[];
  timeline: TimelineEvent[];
}

export default function InstanceDetail() {
  const { id } = useParams()
  const [instance, setInstance] = useState<InstanceData | null>(null)

  useEffect(() => {
    fetch(`/api/instances/${id}`)
      .then(r => r.json())
      .then(setInstance)
  }, [id])

  if (!instance) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 animate-pulse">
        Carregando detalhes da instância...
      </div>
    )
  }

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="text-emerald-500" size={20} />
      case 'rejected': return <XCircle className="text-red-500" size={20} />
      case 'pending': return <Clock className="text-amber-500 animate-pulse" size={20} />
      default: return <Circle className="text-slate-300" size={20} />
    }
  }

  const getStepBadgeColor = (status: Step['status']) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100'
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100'
      default: return 'bg-slate-50 text-slate-500 border-slate-100'
    }
  }

  return (
    <div className="max-w-5xl mx-2 space-y-8 pb-12">
      {/* Header / Breadcrumb */}
      <header className="space-y-4">
        <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Voltar para a lista
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-500">{instance.templateName}</h1>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-mono">
                v{instance.templateVersion}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><User size={14} /> {instance.requester}</span>
              <span className="flex items-center gap-1.5"><FileText size={14} /> ID: #{id?.slice(0,8)}</span>
              <span className={getStepBadgeColor(instance.status as any) + " px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border"}>
                {instance.status}
              </span>
            </div>
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all">
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Etapas do Fluxo */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckSquare size={16} /> Etapas do Fluxo
            </h2>
            <div className="space-y-4">
              {instance.steps.map((step, idx) => (
                <div key={step.id} className="relative flex gap-4 group">
                  {/* Linha conectora vertical */}
                  {idx !== instance.steps.length - 1 && (
                    <div className="absolute left-2.25 top-6 w-0.5 h-full bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                  )}
                  
                  <div className="relative z-10 bg-white py-1">
                    {getStepIcon(step.status)}
                  </div>

                  <div className={getStepBadgeColor(step.status) + " flex-1 p-4 rounded-xl border transition-all hover:shadow-md"}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{step.name}</span>
                      <span className="text-[10px] font-bold uppercase opacity-70">{step.status}</span>
                    </div>
                    <div className="text-xs flex items-center gap-2 opacity-80">
                      <User size={12} />
                      Responsável: {step.approver}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna da Direita: Timeline / Log */}
        <div className="space-y-6">
          <section className="bg-slate-900 text-slate-300 rounded-xl p-6 shadow-xl overflow-hidden relative">
            {/* Decoração sutil de fundo */}
            <Activity className="absolute -right-4 -bottom-4 text-slate-800 w-24 h-24 rotate-12" />
            
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 relative z-10">
              Timeline de Eventos
            </h2>
            
            <div className="space-y-6 relative z-10">
              {instance.timeline.map((event) => (
                <div key={event.id} className="border-l border-slate-700 pl-4 py-1 relative">
                  {/* Ponto da Timeline */}
                  <div className="absolute -left-1.25 top-2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900" />
                  
                  <p className="text-sm text-slate-100 leading-snug">{event.event}</p>
                  <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><User size={10} /> {event.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(event.date).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
