'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import presencesService, { type Presence } from '@/services/presences.service'

const statutLabels: Record<string, string> = {
  present: 'Présent',
  absent: 'Absent',
  retard: 'Retard',
  mission: 'En mission',
  permission: 'Permission',
  conge_maladie: 'Congé maladie',
}

function militaireNom(m: Presence['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return `${m.nom} ${m.prenom}`
  return String(m)
}
function militaireMatricule(m: Presence['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return m.matricule
  return '—'
}
function uniteNom(u: Presence['unite']): string {
  if (!u) return '—'
  if (typeof u === 'object') return u.nom
  return String(u)
}

export default function PresencesPage() {
  const [presences, setPresences] = useState<Presence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  const fetchPresences = useCallback(() => {
    setIsLoading(true)
    presencesService.getAll({ date: selectedDate, limit: 200 })
      .then(res => setPresences((res.data as Presence[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ presences: mock }) => setPresences(mock as unknown as Presence[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [selectedDate])

  useEffect(() => { fetchPresences() }, [fetchPresences])

  const presents  = presences.filter(p => p.statut === 'present').length
  const absents   = presences.filter(p => p.statut === 'absent').length
  const retards   = presences.filter(p => p.statut === 'retard').length
  const enMission = presences.filter(p => p.statut === 'mission').length

  const columns: { key: string; header: string; sortable?: boolean; render: (p: Presence) => React.ReactNode }[] = [
    {
      key: 'matricule',
      header: 'Matricule',
      render: p => <span className="font-mono text-[11px] text-green-400">{militaireMatricule(p.militaire)}</span>,
    },
    {
      key: 'militaire',
      header: 'Militaire',
      sortable: true,
      render: p => (
        <div>
          <div className="text-xs font-medium text-[#e8f0e8]">{militaireNom(p.militaire)}</div>
          {typeof p.militaire === 'object' && p.militaire.grade && (
            <div className="text-[10px] text-[#5a705a]">{String(p.militaire.grade)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'unite',
      header: 'Unité',
      render: p => <span className="font-mono text-xs text-[#8fa88f]">{uniteNom(p.unite)}</span>,
    },
    {
      key: 'heureArrivee',
      header: 'Arrivée',
      render: p => <span className="font-mono text-xs text-[#e8f0e8]">{p.heureArrivee ?? '—'}</span>,
    },
    {
      key: 'heureDepart',
      header: 'Départ',
      render: p => <span className="font-mono text-xs text-[#e8f0e8]">{p.heureDepart ?? '—'}</span>,
    },
    {
      key: 'methode',
      header: 'Méthode',
      render: p => (
        <span className={`text-[11px] font-medium ${
          p.methode === 'biometrique' ? 'text-green-400' :
          p.methode === 'gps' ? 'text-blue-400' : 'text-gray-400'
        }`}>
          {p.methode === 'biometrique' ? '👆 Biométrique' : p.methode === 'gps' ? '📍 GPS' : '✍️ Manuel'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: p => (
        <Badge
          label={statutLabels[p.statut] ?? p.statut}
          variant={
            p.statut === 'present' ? 'actif' :
            p.statut === 'absent' ? 'retraite' :
            p.statut === 'retard' ? 'en_attente' :
            p.statut === 'mission' ? 'mission' : 'permission'
          }
          dot
        />
      ),
    },
    {
      key: 'motifAbsence',
      header: 'Motif',
      render: p => <span className="text-[10px] text-[#5a705a]">{p.motifAbsence ?? '—'}</span>,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Gestion des présences" subtitle="Pointage quotidien · Biométrique & GPS" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Présents" value={isLoading ? '…' : presents} icon={<CheckCircle size={16} />} color="green" size="sm" />
          <StatCard title="En mission" value={isLoading ? '…' : enMission} icon={<Clock size={16} />} color="blue" size="sm" />
          <StatCard title="Retards" value={isLoading ? '…' : retards} icon={<AlertTriangle size={16} />} color="yellow" size="sm" />
          <StatCard title="Absents" value={isLoading ? '…' : absents} icon={<XCircle size={16} />} color="red" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Feuille de présence</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Date de pointage"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              />
              <button type="button" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Download size={13} />
                Exporter
              </button>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              data={presences}
              columns={columns}
              searchPlaceholder="Rechercher par nom, matricule..."
              pageSize={10}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
