'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Download, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import financierService, { type FicheFinanciere } from '@/services/financier.service'

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function militaireNom(m: FicheFinanciere['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return `${m.nom} ${m.prenom}`
  return String(m)
}
function militaireMatricule(m: FicheFinanciere['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return m.matricule
  return '—'
}

export default function FinancierPage() {
  const [fiches, setFiches] = useState<FicheFinanciere[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<FicheFinanciere | null>(null)
  const [filterStatut, setFilterStatut] = useState('')

  useEffect(() => {
    const now = new Date()
    financierService.getAll({ limit: 200, mois: now.getMonth() + 1, annee: now.getFullYear() })
      .then(res => setFiches((res.data as FicheFinanciere[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ fichesFinancieres: mock }) => setFiches(mock as unknown as FicheFinanciere[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterStatut ? fiches.filter(f => f.statut === filterStatut) : fiches
  const totalNet = fiches.reduce((s, f) => s + f.totalNet, 0)
  const payes = fiches.filter(f => f.statut === 'paye').length
  const valides = fiches.filter(f => f.statut === 'valide').length
  const enAttente = fiches.filter(f => f.statut === 'brouillon' || f.statut === 'en_attente').length

  const columns: { key: string; header: string; sortable?: boolean; render: (f: FicheFinanciere) => React.ReactNode }[] = [
    {
      key: 'matricule',
      header: 'Matricule',
      render: f => <span className="font-mono text-[11px] text-green-400">{militaireMatricule(f.militaire)}</span>,
    },
    {
      key: 'militaire',
      header: 'Militaire',
      sortable: true,
      render: f => (
        <div>
          <div className="text-xs font-medium text-[#e8f0e8]">{militaireNom(f.militaire)}</div>
          {typeof f.militaire === 'object' && f.militaire.grade && (
            <div className="text-[10px] text-[#5a705a]">{String(f.militaire.grade)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'periode',
      header: 'Période',
      render: f => (
        <span className="text-xs text-[#8fa88f]">{MOIS[f.periode.mois - 1]} {f.periode.annee}</span>
      ),
    },
    {
      key: 'totalBrut',
      header: 'Brut',
      sortable: true,
      render: f => (
        <span className="text-xs text-[#e8f0e8]">{f.totalBrut.toLocaleString('fr-FR')} {f.devise}</span>
      ),
    },
    {
      key: 'totalDeductions',
      header: 'Déductions',
      render: f => (
        <span className="text-xs text-red-400">-{f.totalDeductions.toLocaleString('fr-FR')} {f.devise}</span>
      ),
    },
    {
      key: 'totalNet',
      header: 'Net à payer',
      sortable: true,
      render: f => (
        <span className="text-xs font-bold text-green-400">{f.totalNet.toLocaleString('fr-FR')} {f.devise}</span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: f => (
        <Badge
          label={f.statut === 'paye' ? 'Payé' : f.statut === 'valide' ? 'Validé' : f.statut === 'en_attente' ? 'En attente' : 'Brouillon'}
          variant={f.statut === 'paye' ? 'actif' : f.statut === 'valide' ? 'mission' : 'en_attente'}
          dot
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Gestion financière" subtitle="Fiches de paie et masse salariale FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Masse salariale nette"
            value={isLoading ? '…' : `${(totalNet / 1000).toFixed(0)}K`}
            icon={<DollarSign size={16} />}
            color="green"
            size="sm"
          />
          <StatCard title="Fiches payées" value={isLoading ? '…' : payes} icon={<CheckCircle size={16} />} color="green" size="sm" />
          <StatCard title="Validées" value={isLoading ? '…' : valides} icon={<TrendingUp size={16} />} color="blue" size="sm" />
          <StatCard title="En attente" value={isLoading ? '…' : enAttente} icon={<AlertTriangle size={16} />} color="yellow" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <DollarSign size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Fiches financières</span>
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
                <option value="brouillon">Brouillon</option>
                <option value="en_attente">En attente</option>
                <option value="valide">Validé</option>
                <option value="paye">Payé</option>
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
              searchPlaceholder="Rechercher par nom, matricule..."
              pageSize={10}
              actions={(f: FicheFinanciere) => (
                <button
                  type="button"
                  title="Voir fiche"
                  onClick={() => setSelected(f)}
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
          title={militaireNom(selected.militaire)}
          subtitle={`Fiche · ${MOIS[selected.periode.mois - 1]} ${selected.periode.annee}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Matricule', militaireMatricule(selected.militaire)],
                ['Période', `${MOIS[selected.periode.mois - 1]} ${selected.periode.annee}`],
                ['Statut', selected.statut],
                ['Devise', selected.devise],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Détail salaire</div>
              <div className="space-y-1.5">
                {[
                  ['Salaire de base', selected.salaire.base],
                  ['Indemnité grade', selected.salaire.indemniteGrade],
                  ['Indemnité commandement', selected.salaire.indemniteCommandement],
                  ['Indemnité mission', selected.salaire.indemniteMission],
                  ['Indemnité risque', selected.salaire.indemniteRisque],
                  ['Indemnité front', selected.salaire.indemniteFront],
                  ['Heures supplémentaires', selected.salaire.heuresSupp],
                ].filter(([, v]) => v != null && v !== 0).map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between text-xs">
                    <span className="text-[#5a705a]">{l}</span>
                    <span className="text-[#e8f0e8]">{Number(v).toLocaleString('fr-FR')} {selected.devise}</span>
                  </div>
                ))}
                <div className="border-t border-[#1e321e] mt-2 pt-2 flex justify-between text-xs font-bold">
                  <span className="text-[#8fa88f]">Total brut</span>
                  <span className="text-[#e8f0e8]">{selected.totalBrut.toLocaleString('fr-FR')} {selected.devise}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-[#0a110a] rounded-xl border border-red-500/20">
              <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Déductions</div>
              <div className="space-y-1.5">
                {[
                  ['Impôt sur le revenu', selected.deductions.impotRevenu],
                  ['CNSS', selected.deductions.cnss],
                  ['Mutuelle', selected.deductions.mutuelle],
                  ['Prêt', selected.deductions.pret],
                ].filter(([, v]) => v != null && v !== 0).map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between text-xs">
                    <span className="text-[#5a705a]">{l}</span>
                    <span className="text-red-400">-{Number(v).toLocaleString('fr-FR')} {selected.devise}</span>
                  </div>
                ))}
                <div className="border-t border-red-500/20 mt-2 pt-2 flex justify-between text-xs font-bold">
                  <span className="text-red-400">Total déductions</span>
                  <span className="text-red-400">-{selected.totalDeductions.toLocaleString('fr-FR')} {selected.devise}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30 flex justify-between items-center">
              <span className="text-sm font-semibold text-[#e8f0e8]">Net à payer</span>
              <span className="text-lg font-bold text-green-400">{selected.totalNet.toLocaleString('fr-FR')} {selected.devise}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
