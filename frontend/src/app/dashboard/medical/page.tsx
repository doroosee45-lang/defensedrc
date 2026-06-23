'use client'

import { useState, useEffect } from 'react'
import { Heart, Shield, AlertTriangle, Activity, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import medicalService, { type DossierMedical } from '@/services/medical.service'

const aptitudeConfig: Record<string, { label: string; variant: 'actif' | 'blesse' | 'en_attente' | 'retraite' | 'mission' | 'permission' }> = {
  apte:          { label: 'Apte',           variant: 'actif' },
  apte_reserve:  { label: 'Apte (réserve)', variant: 'en_attente' },
  inapte_temp:   { label: 'Inapte temp.',   variant: 'mission' },
  inapte_def:    { label: 'Inapte déf.',    variant: 'retraite' },
  en_evaluation: { label: 'En évaluation',  variant: 'en_attente' },
}

function militaireNom(m: DossierMedical['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return `${m.nom} ${m.prenom}`
  return String(m)
}
function militaireMatricule(m: DossierMedical['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return m.matricule
  return '—'
}

export default function MedicalPage() {
  const [dossiers, setDossiers] = useState<DossierMedical[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<DossierMedical | null>(null)
  const [filterAptitude, setFilterAptitude] = useState('')

  useEffect(() => {
    medicalService.getAll({ limit: 200 })
      .then(res => setDossiers((res.data as DossierMedical[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ dossiersMedicaux: mock }) => setDossiers(mock as unknown as DossierMedical[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterAptitude ? dossiers.filter(d => d.aptitudeMedicale === filterAptitude) : dossiers
  const aptes = dossiers.filter(d => d.aptitudeMedicale === 'apte').length
  const inaptes = dossiers.filter(d => d.aptitudeMedicale === 'inapte_def').length
  const enEvaluation = dossiers.filter(d => d.aptitudeMedicale === 'en_evaluation').length
  const blessesOp = dossiers.filter(d => d.blessuresOperation && d.blessuresOperation.length > 0).length

  const columns: { key: string; header: string; sortable?: boolean; render: (d: DossierMedical) => React.ReactNode }[] = [
    {
      key: 'matricule',
      header: 'Matricule',
      render: d => <span className="font-mono text-[11px] text-green-400">{militaireMatricule(d.militaire)}</span>,
    },
    {
      key: 'militaire',
      header: 'Militaire',
      sortable: true,
      render: d => <span className="text-xs font-medium text-[#e8f0e8]">{militaireNom(d.militaire)}</span>,
    },
    {
      key: 'groupeSanguin',
      header: 'Groupe sanguin',
      render: d => (
        <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
          {d.groupeSanguin ?? '—'}
        </span>
      ),
    },
    {
      key: 'aptitudeMedicale',
      header: 'Aptitude',
      render: d => {
        const cfg = aptitudeConfig[d.aptitudeMedicale] ?? { label: d.aptitudeMedicale, variant: 'en_attente' as const }
        return <Badge label={cfg.label} variant={cfg.variant} dot />
      },
    },
    {
      key: 'indiceSante',
      header: 'Indice santé',
      render: d => {
        const idx = d.indiceSante ?? 0
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-[#1e321e] rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${idx >= 80 ? 'bg-green-500' : idx >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${idx}%` }}
              />
            </div>
            <span className="text-[10px] text-[#5a705a]">{idx}/100</span>
          </div>
        )
      },
    },
    {
      key: 'vaccinations',
      header: 'Vaccins',
      render: d => <span className="text-xs text-[#8fa88f]">{d.vaccinations?.length ?? 0}</span>,
    },
    {
      key: 'blessures',
      header: 'Blessures op.',
      render: d => {
        const n = d.blessuresOperation?.length ?? 0
        return n > 0
          ? <span className="text-xs font-medium text-red-400">{n}</span>
          : <span className="text-xs text-[#5a705a]">0</span>
      },
    },
    {
      key: 'dateVisite',
      header: 'Dernière visite',
      render: d => (
        <span className="text-[10px] text-[#8fa88f]">
          {d.dateVisiteMedicale ? new Date(d.dateVisiteMedicale).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Dossiers médicaux" subtitle="Suivi santé et aptitudes militaires FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Aptes" value={isLoading ? '…' : aptes} icon={<Heart size={16} />} color="green" size="sm" />
          <StatCard title="Blessés opération" value={isLoading ? '…' : blessesOp} icon={<Activity size={16} />} color="red" size="sm" />
          <StatCard title="En évaluation" value={isLoading ? '…' : enEvaluation} icon={<Shield size={16} />} color="yellow" size="sm" />
          <StatCard title="Inaptes définitifs" value={isLoading ? '…' : inaptes} icon={<AlertTriangle size={16} />} color="red" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Heart size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Dossiers médicaux</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <select
              aria-label="Filtrer par aptitude"
              value={filterAptitude}
              onChange={e => setFilterAptitude(e.target.value)}
              className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
            >
              <option value="">Toutes aptitudes</option>
              {Object.entries(aptitudeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par nom, matricule..."
              pageSize={10}
              actions={(d: DossierMedical) => (
                <button
                  type="button"
                  title="Voir dossier"
                  onClick={() => setSelected(d)}
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
          subtitle={`Dossier médical · ${militaireMatricule(selected.militaire)}`}
          size="lg"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Aptitude', aptitudeConfig[selected.aptitudeMedicale]?.label ?? selected.aptitudeMedicale],
                ['Groupe sanguin', selected.groupeSanguin ?? '—'],
                ['Indice santé', `${selected.indiceSante ?? '—'}/100`],
                ['Dernière visite', selected.dateVisiteMedicale ? new Date(selected.dateVisiteMedicale).toLocaleDateString('fr-FR') : '—'],
                ['Prochaine visite', selected.prochaineDateVisite ? new Date(selected.prochaineDateVisite).toLocaleDateString('fr-FR') : '—'],
                ['Vaccinations', String(selected.vaccinations?.length ?? 0)],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            {selected.allergies && selected.allergies.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-red-500/20">
                <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Allergies</div>
                <div className="flex flex-wrap gap-1">
                  {selected.allergies.map(a => (
                    <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {selected.blessuresOperation && selected.blessuresOperation.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Blessures en opération</div>
                <div className="space-y-2">
                  {selected.blessuresOperation.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-[10px] text-[#5a705a] mt-0.5">{new Date(b.date).toLocaleDateString('fr-FR')}</span>
                      <span className="text-[#e8f0e8]">{b.description}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto flex-shrink-0 ${b.severite === 'grave' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{b.severite}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.consultations && selected.consultations.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Dernières consultations</div>
                <div className="space-y-2">
                  {selected.consultations.slice(0, 3).map((c, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#e8f0e8] font-medium">{c.motif}</span>
                        <span className="text-[10px] text-[#5a705a]">{new Date(c.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {c.diagnostic && <div className="text-[10px] text-[#8fa88f] mt-0.5">{c.diagnostic}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
