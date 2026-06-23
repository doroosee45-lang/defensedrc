'use client'

import { useState, useEffect } from 'react'
import { Truck, Package, AlertTriangle, CheckCircle, MapPin, Eye, Plus } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import logistiqueService, { type TransfertLogistique } from '@/services/logistique.service'

const statutConfig: Record<string, { label: string; variant: 'actif' | 'blesse' | 'en_attente' | 'retraite' | 'mission' | 'permission' }> = {
  planifie:  { label: 'Planifié',   variant: 'en_attente' },
  en_route:  { label: 'En route',   variant: 'mission' },
  livre:     { label: 'Livré',      variant: 'actif' },
  annule:    { label: 'Annulé',     variant: 'retraite' },
  incident:  { label: 'Incident',   variant: 'blesse' },
}

const prioriteConfig: Record<string, { label: string; color: string }> = {
  critique: { label: 'Critique', color: 'text-red-400' },
  haute:    { label: 'Haute',    color: 'text-orange-400' },
  normale:  { label: 'Normale',  color: 'text-[#8fa88f]' },
  basse:    { label: 'Basse',    color: 'text-[#5a705a]' },
}

function uniteLabel(u: TransfertLogistique['uniteExpeditrice']): string {
  if (!u) return '—'
  if (typeof u === 'object') return u.nom
  return String(u)
}

export default function LogistiquePage() {
  const [transferts, setTransferts] = useState<TransfertLogistique[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<TransfertLogistique | null>(null)
  const [filterStatut, setFilterStatut] = useState('')

  useEffect(() => {
    logistiqueService.getAll({ limit: 200 })
      .then(res => setTransferts((res.data as TransfertLogistique[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ transfertsLogistique: mock }) => setTransferts(mock as unknown as TransfertLogistique[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterStatut ? transferts.filter(t => t.statut === filterStatut) : transferts
  const enRoute = transferts.filter(t => t.statut === 'en_route').length
  const livres = transferts.filter(t => t.statut === 'livre').length
  const alertes = transferts.filter(t => t.alerteDeviation?.active).length

  const columns: { key: string; header: string; sortable?: boolean; render: (t: TransfertLogistique) => React.ReactNode }[] = [
    {
      key: 'numeroTransfert',
      header: 'N° Transfert',
      render: t => <span className="font-mono text-[11px] text-green-400">{t.numeroTransfert}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: t => <span className="text-xs text-[#e8f0e8]">{t.type}</span>,
    },
    {
      key: 'expediteur',
      header: 'Expéditeur',
      render: t => <span className="font-mono text-xs text-[#8fa88f]">{uniteLabel(t.uniteExpeditrice)}</span>,
    },
    {
      key: 'destinataire',
      header: 'Destinataire',
      render: t => <span className="font-mono text-xs text-[#8fa88f]">{uniteLabel(t.uniteDestinataire)}</span>,
    },
    {
      key: 'articles',
      header: 'Articles',
      render: t => (
        <span className="text-xs text-[#e8f0e8]">
          {t.articles.length} article{t.articles.length > 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'priorite',
      header: 'Priorité',
      render: t => {
        const cfg = prioriteConfig[t.priorite] ?? prioriteConfig.normale
        return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
      },
    },
    {
      key: 'dateLivraisonPrevue',
      header: 'Livraison prévue',
      sortable: true,
      render: t => (
        <span className="text-[10px] text-[#8fa88f]">
          {t.dateLivraisonPrevue ? new Date(t.dateLivraisonPrevue).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: t => {
        const cfg = statutConfig[t.statut] ?? { label: t.statut, variant: 'en_attente' as const }
        return (
          <div className="flex items-center gap-1">
            <Badge label={cfg.label} variant={cfg.variant} dot />
            {t.alerteDeviation?.active && <AlertTriangle size={11} className="text-red-400" />}
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Logistique & Transferts" subtitle="Acheminement des ressources FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total transferts" value={isLoading ? '…' : transferts.length} icon={<Package size={16} />} color="green" size="sm" />
          <StatCard title="En route" value={isLoading ? '…' : enRoute} icon={<Truck size={16} />} color="blue" size="sm" />
          <StatCard title="Alertes déviation" value={isLoading ? '…' : alertes} icon={<AlertTriangle size={16} />} color="red" size="sm" />
          <StatCard title="Livrés" value={isLoading ? '…' : livres} icon={<CheckCircle size={16} />} color="green" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Registre des transferts</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label="Filtrer par statut"
                value={filterStatut}
                onChange={e => setFilterStatut(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              >
                <option value="">Tous statuts</option>
                {Object.entries(statutConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button type="button" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Plus size={13} />
                Nouveau transfert
              </button>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par numéro, type..."
              pageSize={10}
              actions={(t: TransfertLogistique) => (
                <button
                  type="button"
                  title="Voir détails"
                  onClick={() => setSelected(t)}
                  className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all"
                >
                  <Eye size={14} />
                </button>
              )}
            />
          </div>
        </div>
      </div>

      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={`Transfert ${selected.numeroTransfert}`}
          subtitle={`${selected.type} · ${statutConfig[selected.statut]?.label ?? selected.statut}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['N° Transfert', selected.numeroTransfert],
                ['Type', selected.type],
                ['Priorité', prioriteConfig[selected.priorite]?.label ?? selected.priorite],
                ['Statut', statutConfig[selected.statut]?.label ?? selected.statut],
                ['Expéditeur', uniteLabel(selected.uniteExpeditrice)],
                ['Destinataire', uniteLabel(selected.uniteDestinataire)],
                ['Date départ', selected.dateDepart ? new Date(selected.dateDepart).toLocaleDateString('fr-FR') : '—'],
                ['Livraison prévue', selected.dateLivraisonPrevue ? new Date(selected.dateLivraisonPrevue).toLocaleDateString('fr-FR') : '—'],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Articles ({selected.articles.length})</div>
              <div className="space-y-1.5">
                {selected.articles.map((a, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-[#e8f0e8]">{a.designation}</span>
                    <span className="text-[#8fa88f] font-mono">{a.quantite} {a.unite ?? ''}</span>
                  </div>
                ))}
              </div>
            </div>
            {selected.positionActuelle && (
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={10} />
                  Position actuelle
                </div>
                <div className="text-xs font-mono text-green-400">
                  {selected.positionActuelle.lat.toFixed(4)}°, {selected.positionActuelle.lng.toFixed(4)}°
                </div>
              </div>
            )}
            {selected.alerteDeviation?.active && (
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <div>
                  <div className="text-xs font-semibold text-red-400">Alerte déviation</div>
                  {selected.alerteDeviation.description && (
                    <div className="text-[10px] text-red-300 mt-0.5">{selected.alerteDeviation.description}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
