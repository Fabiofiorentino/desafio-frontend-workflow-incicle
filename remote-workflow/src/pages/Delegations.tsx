import { useEffect, useState } from 'react'
import { 
  UserPlus, 
  Calendar, 
  Trash2, 
  RefreshCcw, 
  AlertTriangle, 
  ArrowRight,
  UserCheck
} from 'lucide-react'
import type { Delegation } from '../mocks/data/delegations'

export default function Delegations() {
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [cycleChain, setCycleChain] = useState<string[] | null>(null)
  const [delegate, setDelegate] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch('/api/delegations').then(r => r.json()).then(setDelegations)
  }, [])

  async function handleCreate() {
    setIsLoading(true)
    setCycleChain(null)
    const res = await fetch('/api/delegations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delegate, from, to }),
    })

    if (res.status === 422) {
      const data = await res.json()
      setCycleChain(data.chain)
      setIsLoading(false)
      return
    }

    const created = await res.json()
    setDelegations(prev => [...prev, created])
    setDelegate(''); setFrom(''); setTo('')
    setIsLoading(false)
  }

  async function handleCancel(id: string) {
    await fetch(`/api/delegations/${id}`, { method: 'DELETE' })
    setDelegations(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="max-w-5xl mx-4 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-slate-500">Gerenciar Delegações</h1>
        <p className="text-sm text-slate-500">Transfira sua autoridade de aprovação temporariamente para outro usuário.</p>
      </header>

      {/* Card de Nova Delegação */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <UserPlus size={18} className="text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nova Delegação</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-50 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1">Substituto (Delegado)</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  placeholder="Nome ou ID do usuário" 
                  value={delegate} 
                  onChange={e => setDelegate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="w-40 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1">Início</label>
              <input 
                type="date" 
                value={from} 
                onChange={e => setFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="w-40 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-1">Término</label>
              <input 
                type="date" 
                value={to} 
                onChange={e => setTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button 
              onClick={handleCreate}
              disabled={isLoading || !delegate}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 h-[38px]"
            >
              {isLoading ? 'Criando...' : 'Ativar Delegação'}
            </button>
          </div>

          {/* Alerta de Ciclo */}
          {cycleChain && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 text-red-700 mb-3">
                <AlertTriangle size={20} />
                <span className="font-bold text-sm">Erro de Impedimento: Ciclo de Delegação Detectado</span>
              </div>
              <p className="text-xs text-red-600 mb-4 ml-7">
                Não é possível completar esta ação pois ela criaria um loop infinito de aprovações:
              </p>
              <div className="flex items-center flex-wrap gap-2 ml-7">
                {cycleChain.map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="bg-white border border-red-200 px-3 py-1 rounded-full text-xs font-bold text-red-700 shadow-sm">
                      {name}
                    </span>
                    {i < cycleChain.length - 1 && <ArrowRight size={14} className="text-red-300" />}
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} className="text-red-300" />
                  <RefreshCcw size={14} className="text-red-400 animate-spin-slow" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Listagem de Delegações Ativas */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          <RefreshCcw size={16} /> Delegações Ativas ({delegations.length})
        </h2>
        
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
          {delegations.length > 0 ? (
            delegations.map(d => (
              <div key={d.id} className="group flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs border border-indigo-100">
                    {d.delegate.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{d.delegate}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar size={12} />
                      <span>{d.from}</span>
                      <ArrowRight size={10} />
                      <span>{d.to}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleCancel(d.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                  Cancelar
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm italic">Nenhuma delegação ativa no momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
