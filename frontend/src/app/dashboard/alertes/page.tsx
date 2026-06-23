'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, AlertTriangle, CheckCircle, Filter, X, RefreshCw } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import alertesService, { type Alerte } from '@/services/alertes.service'

const borderColor = (niveau: string) => {
  switch (niveau) {
    case 'critique': return 'border-l-red-500 border-red-500/30 hover:border-red-500/50'
    case 'haute': return 'border-l-orange-500 border-orange-500/30 hover:border-orange-500/50'
    case 'moyenne': return 'border-l-yellow-500 border-yellow-500/30 hover:border-yellow-500/50'
    default: return 'border-l-blue-500 border-blue-500/30 hover:border-blue-500/50'
  }
}

const bgColor = (niveau: string) => {
  switch (niveau) {
    case 'critique': return 'bg-red-500/5'
    case 'haute': return 'bg-orange-500/5'
    case 'moyenne': return 'bg-yellow-500/5'
    default: return 'bg-blue-500/5'
  }
}

const dotColor = (niveau: string) => {
  switch (niveau) {
    case 'critique': return 'bg-red-500'
    case 'haute': return 'bg-orange-500'
    case 'moyenne': return 'bg-yellow-500'
    default: return 'bg-blue-500'
  }
}

const statutLabel: Record<string, string> = {
  active: 'Active',
  lue: 'Lue',
  traitee: 'Traitée',
  fermee: 'Fermée',
  ignoree: 'Ignorée',
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterNiveau, setFilterNiveau] = useState('')
  const [filterStatut, setFilterStatut] = useState('')

  const fetchAlertes = useCallback(() => {
    setIsLoading(true)
    alertesService.getAll()
      .then(res => setAlertes((res.data as Alerte[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ alertes: mock }) => setAlertes(mock as unknown as Alerte[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetchAlertes() }, [fetchAlertes])

  const filtered = alertes
    .filter(a => !filterNiveau || a.niveau === filterNiveau)
    .filter(a => !filterStatut || a.statut === filterStatut)

  const critiques = alertes.filter(a => a.niveau === 'critique').length
  const hautes = alertes.filter(a => a.niveau === 'haute').length
  const actives = alertes.filter(a => a.statut === 'active').length

  const handleTraiter = async (id: string) => {
    try {
      await alertesService.traiter(id, 'Traité depuis le centre des alertes')
      setAlertes(prev => prev.map(a => a._id === id ? { ...a, statut: 'traitee' as const } : a))
    } catch {}
  }

  const handleFermer = async (id: string) => {
    try {
      await alertesService.update(id, { statut: 'fermee' })
      setAlertes(prev => prev.map(a => a._id === id ? { ...a, statut: 'fermee' as const } : a))
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Centre des alertes" subtitle="Alertes opérationnelles et de sécurité FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Alertes critiques" value={isLoading ? '…' : critiques} icon={<AlertTriangle size={16} />} color="red" size="sm" />
          <StatCard title="Alertes hautes" value={isLoading ? '…' : hautes} icon={<Bell size={16} />} color="yellow" size="sm" />
          <StatCard title="Actives" value={isLoading ? '…' : actives} icon={<Bell size={16} />} color="blue" size="sm" />
          <StatCard title="Total alertes" value={isLoading ? '…' : alertes.length} icon={<Bell size={16} />} color="gray" size="sm" />
        </div>

        {/* Critical alerts highlight */}
        {!isLoading && alertes.filter(a => a.niveau === 'critique' && a.statut === 'active').length > 0 && (
          <div className="border border-red-500/30 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 status-live" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Alertes critiques non traitées</span>
            </div>
            {alertes.filter(a => a.niveau === 'critique' && a.statut === 'active').map(a => (
              <div key={a._id} className="px-4 py-3 bg-red-500/5 border-b border-red-500/20 last:border-0">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#e8f0e8] mb-0.5">{a.titre}</div>
                    <p className="text-xs text-[#8fa88f]">{a.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#5a705a]">{a.createdAt ? new Date(a.createdAt).toLocaleString('fr-FR') : ''}</span>
                      {a.localisation?.province && <span className="text-[10px] text-[#5a705a]">Province : {a.localisation.province}</span>}
                      {a.source && <span className="text-[10px] text-[#5a705a]">Source : {a.source}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button type="button" onClick={() => handleTraiter(a._id)} className="px-2.5 py-1 rounded-lg text-[11px] bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors">Traiter</button>
                    <button type="button" onClick={() => handleFermer(a._id)} className="px-2.5 py-1 rounded-lg text-[11px] bg-[#1a261a] text-[#5a705a] border border-[#1e321e] hover:text-[#e8f0e8] transition-colors">Fermer</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All alerts */}
        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[#5a705a]" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Journal des alertes</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={13} className="text-[#5a705a]" />
              <select
                aria-label="Filtrer par niveau"
                value={filterNiveau}
                onChange={e => setFilterNiveau(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              >
                <option value="">Tous niveaux</option>
                <option value="critique">Critique</option>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
              <select
                aria-label="Filtrer par statut"
                value={filterStatut}
                onChange={e => setFilterStatut(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              >
                <option value="">Tous statuts</option>
                <option value="active">Active</option>
                <option value="lue">Lue</option>
                <option value="traitee">Traitée</option>
                <option value="fermee">Fermée</option>
              </select>
              <button type="button" onClick={fetchAlertes} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <RefreshCw size={12} />
                Actualiser
              </button>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12 text-xs text-[#5a705a]">Aucune alerte trouvée</div>
            )}
            {filtered.map(a => (
              <div
                key={a._id}
                className={`border border-l-4 rounded-xl p-4 transition-all ${borderColor(a.niveau)} ${bgColor(a.niveau)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor(a.niveau)} ${a.statut === 'active' ? 'status-live' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge label={a.niveau} variant={a.niveau as 'critique' | 'haute' | 'basse'} size="xs" />
                      <Badge
                        label={statutLabel[a.statut] ?? a.statut}
                        variant={a.statut === 'active' ? 'en_attente' : a.statut === 'traitee' ? 'actif' : 'retraite'}
                        size="xs"
                      />
                      {a.type && <span className="text-[10px] text-[#5a705a]">{a.type}</span>}
                    </div>
                    <h4 className="text-xs font-bold text-[#e8f0e8] mb-1">{a.titre}</h4>
                    <p className="text-xs text-[#8fa88f] leading-relaxed">{a.description}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-[10px] text-[#5a705a]">{a.createdAt ? new Date(a.createdAt).toLocaleString('fr-FR') : ''}</span>
                      {a.localisation?.province && <span className="text-[10px] text-[#5a705a]">Province : {a.localisation.province}</span>}
                      {a.unitesConcernees?.[0] && <span className="text-[10px] text-[#5a705a]">Unité : {a.unitesConcernees[0].nom}</span>}
                      {a.source && <span className="text-[10px] text-[#5a705a]">Source : {a.source}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {a.statut === 'active' && (
                      <button type="button" onClick={() => handleTraiter(a._id)} className="px-2.5 py-1 rounded-lg text-[11px] bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors">
                        <CheckCircle size={11} className="inline mr-1" />
                        Traiter
                      </button>
                    )}
                    <button type="button" onClick={() => handleFermer(a._id)} className="p-1.5 rounded-lg text-[#5a705a] hover:text-[#8fa88f] hover:bg-[#1a261a] transition-all">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
