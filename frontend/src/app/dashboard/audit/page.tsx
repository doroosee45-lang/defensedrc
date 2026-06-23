'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, AlertTriangle, Activity, Clock, Download } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import auditService, { type AuditLog } from '@/services/audit.service'

const actionLabels: Record<string, string> = {
  consultation: 'Consultation',
  creation: 'Création',
  modification: 'Modification',
  suppression: 'Suppression',
  export: 'Export',
  connexion: 'Connexion',
  deconnexion: 'Déconnexion',
}

const riskConfig: Record<string, { label: string; color: string }> = {
  faible:  { label: 'Faible',  color: 'text-green-400' },
  moyen:   { label: 'Moyen',   color: 'text-yellow-400' },
  eleve:   { label: 'Élevé',   color: 'text-orange-400' },
  critique:{ label: 'Critique',color: 'text-red-400' },
}

function utilisateurLabel(u: AuditLog['utilisateur'], log: AuditLog): string {
  if (log.nomUtilisateur) return log.nomUtilisateur
  if (!u) return log.matricule ?? '—'
  if (typeof u === 'object') return `${u.nom} ${u.prenom}`
  return String(u)
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRisque, setFilterRisque] = useState('')
  const [filterAction, setFilterAction] = useState('')

  useEffect(() => {
    auditService.getAll({ limit: 200 })
      .then(res => setLogs((res.data as AuditLog[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ auditLogs: mock }) => setLogs(mock as unknown as AuditLog[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  let filtered = logs
  if (filterRisque) filtered = filtered.filter(l => l.niveauRisque === filterRisque)
  if (filterAction) filtered = filtered.filter(l => l.action === filterAction)

  const critiques = logs.filter(l => l.niveauRisque === 'critique').length
  const echecs = logs.filter(l => l.statut === 'echec').length
  const elevees = logs.filter(l => l.niveauRisque === 'eleve').length

  const columns: { key: string; header: string; sortable?: boolean; render: (l: AuditLog) => React.ReactNode }[] = [
    {
      key: 'date',
      header: 'Date/Heure',
      sortable: true,
      render: l => (
        <span className="font-mono text-[10px] text-[#8fa88f]">
          {new Date(l.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'utilisateur',
      header: 'Utilisateur',
      sortable: true,
      render: l => <span className="text-xs font-medium text-[#e8f0e8]">{utilisateurLabel(l.utilisateur, l)}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: l => <span className="text-xs text-[#8fa88f]">{actionLabels[l.action] ?? l.action}</span>,
    },
    {
      key: 'module',
      header: 'Module',
      render: l => (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1a261a] border border-[#1e321e] text-[#8fa88f]">
          {l.module}
        </span>
      ),
    },
    {
      key: 'ressource',
      header: 'Ressource',
      render: l => <span className="text-[10px] text-[#5a705a]">{l.ressource ?? '—'}</span>,
    },
    {
      key: 'dureeMs',
      header: 'Durée',
      render: l => (
        <span className={`font-mono text-[10px] ${(l.dureeMs ?? 0) > 1000 ? 'text-yellow-400' : 'text-[#5a705a]'}`}>
          {l.dureeMs != null ? `${l.dureeMs}ms` : '—'}
        </span>
      ),
    },
    {
      key: 'niveauRisque',
      header: 'Risque',
      render: l => {
        const cfg = riskConfig[l.niveauRisque] ?? { label: l.niveauRisque, color: 'text-[#8fa88f]' }
        return <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
      },
    },
    {
      key: 'statut',
      header: 'Statut',
      render: l => (
        <Badge
          label={l.statut === 'succes' ? 'Succès' : l.statut === 'echec' ? 'Échec' : l.statut}
          variant={l.statut === 'succes' ? 'actif' : 'blesse'}
          dot
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Journal d'audit" subtitle="Traçabilité des actions MILSYS RDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total entrées" value={isLoading ? '…' : logs.length} icon={<Activity size={16} />} color="green" size="sm" />
          <StatCard title="Critiques" value={isLoading ? '…' : critiques} icon={<AlertTriangle size={16} />} color="red" size="sm" />
          <StatCard title="Risque élevé" value={isLoading ? '…' : elevees} icon={<Shield size={16} />} color="yellow" size="sm" />
          <StatCard title="Échecs" value={isLoading ? '…' : echecs} icon={<Clock size={16} />} color="red" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Search size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Journal d'activité</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label="Filtrer par niveau de risque"
                value={filterRisque}
                onChange={e => setFilterRisque(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              >
                <option value="">Tous niveaux</option>
                {Object.entries(riskConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select
                aria-label="Filtrer par action"
                value={filterAction}
                onChange={e => setFilterAction(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              >
                <option value="">Toutes actions</option>
                {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="button" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Download size={13} />
                Exporter
              </button>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par utilisateur, module, action..."
              pageSize={15}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
