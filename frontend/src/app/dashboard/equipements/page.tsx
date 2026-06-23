'use client'

import { useState, useEffect } from 'react'
import { Package, Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import equipementsService, { type Equipement } from '@/services/equipements.service'

const typeLabels: Record<string, string> = {
  armement: 'Armement', munitions: 'Munitions', vehicule: 'Véhicule', communication: 'Communication',
  protection: 'Protection', medical: 'Médical', logistique: 'Logistique', electronique: 'Électronique',
}

const etatLabels: Record<string, string> = {
  bon: 'Bon état', acceptable: 'Acceptable', mauvais: 'Mauvais état', hors_service: 'H.S.',
}

function uniteNom(u: Equipement['unite']): string {
  if (!u) return '—'
  if (typeof u === 'object') return u.nom
  return String(u)
}

export default function EquipementsPage() {
  const [equipements, setEquipements] = useState<Equipement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Equipement | null>(null)
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    equipementsService.getAll({ limit: 200 })
      .then(res => setEquipements((res.data as Equipement[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ equipements: mock }) => setEquipements(mock as unknown as Equipement[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterType ? equipements.filter(e => e.type === filterType) : equipements
  const disponibles = equipements.filter(e => e.quantiteDisponible > 0).length
  const alertes = equipements.filter(e => e.seuilAlerte != null && e.quantiteDisponible <= e.seuilAlerte).length
  const total = equipements.reduce((s, e) => s + e.quantite, 0)

  const columns: { key: string; header: string; sortable?: boolean; render: (e: Equipement) => React.ReactNode }[] = [
    {
      key: 'code',
      header: 'Code',
      render: e => <span className="font-mono text-[11px] text-green-400">{e.code}</span>,
    },
    {
      key: 'designation',
      header: 'Désignation',
      sortable: true,
      render: e => (
        <div>
          <div className="text-xs font-medium text-[#e8f0e8]">{e.designation}</div>
          <div className="text-[10px] text-[#5a705a]">{typeLabels[e.type] ?? e.type}{e.marque ? ` · ${e.marque}` : ''}</div>
        </div>
      ),
    },
    {
      key: 'unite',
      header: 'Unité',
      render: e => <span className="font-mono text-xs text-[#8fa88f]">{uniteNom(e.unite)}</span>,
    },
    {
      key: 'quantite',
      header: 'Quantité',
      sortable: true,
      render: e => (
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-[#e8f0e8]">{e.quantiteDisponible}</span>
          <span className="text-[10px] text-[#5a705a]">/ {e.quantite}</span>
          {e.seuilAlerte != null && e.quantiteDisponible <= e.seuilAlerte && (
            <AlertTriangle size={11} className="text-red-400" />
          )}
        </div>
      ),
    },
    {
      key: 'etat',
      header: 'État',
      render: e => (
        <Badge
          label={etatLabels[e.etat] ?? e.etat}
          variant={e.etat === 'bon' ? 'actif' : e.etat === 'hors_service' ? 'blesse' : 'en_attente'}
          dot
        />
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: e => <span className="text-xs text-[#8fa88f]">{e.statut}</span>,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Équipements & Armements" subtitle="Inventaire et gestion des équipements FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Références" value={isLoading ? '…' : equipements.length} icon={<Package size={16} />} color="green" size="sm" />
          <StatCard title="Total articles" value={isLoading ? '…' : total.toLocaleString('fr-FR')} icon={<Shield size={16} />} color="blue" size="sm" />
          <StatCard title="Disponibles" value={isLoading ? '…' : disponibles} icon={<CheckCircle size={16} />} color="green" size="sm" />
          <StatCard title="Alertes stock" value={isLoading ? '…' : alertes} icon={<AlertTriangle size={16} />} color="red" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Package size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Inventaire des équipements</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <select
              aria-label="Filtrer par type"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
            >
              <option value="">Tous types</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par code, désignation..."
              pageSize={10}
              actions={(e: Equipement) => (
                <button
                  type="button"
                  title="Voir détails"
                  onClick={() => setSelected(e)}
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
          title={selected.designation}
          subtitle={`${selected.code} · ${typeLabels[selected.type] ?? selected.type}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Code', selected.code],
              ['Type', typeLabels[selected.type] ?? selected.type],
              ['Marque', selected.marque ?? '—'],
              ['Modèle', selected.modele ?? '—'],
              ['Calibre', selected.calibre ?? '—'],
              ['Quantité totale', selected.quantite.toString()],
              ['Disponible', selected.quantiteDisponible.toString()],
              ['Seuil alerte', selected.seuilAlerte?.toString() ?? '—'],
              ['État', etatLabels[selected.etat] ?? selected.etat],
              ['Statut', selected.statut],
              ['Unité', uniteNom(selected.unite)],
              ['Valeur USD', selected.valeurUSD ? `${selected.valeurUSD.toLocaleString()} USD` : '—'],
              ['Classification', selected.classification ?? '—'],
              ['Date acquisition', selected.dateAcquisition ? new Date(selected.dateAcquisition).toLocaleDateString('fr-FR') : '—'],
            ].map(([l, v]) => (
              <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
