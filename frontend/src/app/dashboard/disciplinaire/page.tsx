'use client'

import { useState, useEffect } from 'react'
import { Shield, Star, AlertOctagon, Award, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import disciplinaireService, { type DossierDisciplinaire } from '@/services/disciplinaire.service'
import { clsx } from 'clsx'

function militaireNom(m: DossierDisciplinaire['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return `${m.nom} ${m.prenom}`
  return String(m)
}
function militaireMatricule(m: DossierDisciplinaire['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return m.matricule
  return '—'
}

export default function DisciplinairePage() {
  const [dossiers, setDossiers] = useState<DossierDisciplinaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'disciplinaire' | 'distinctions'>('disciplinaire')
  const [selected, setSelected] = useState<DossierDisciplinaire | null>(null)

  useEffect(() => {
    disciplinaireService.getAll({ limit: 200 })
      .then(res => setDossiers((res.data as DossierDisciplinaire[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ dossiersDisciplinaires: mock }) => setDossiers(mock as unknown as DossierDisciplinaire[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const infractions = dossiers.filter(d => d.type === 'infraction' || d.type === 'avertissement')
  const sanctions = dossiers.filter(d => d.type === 'sanction')
  const distinctions = dossiers.filter(d => d.type === 'distinction' || d.type === 'felicitation')
  const ouverts = dossiers.filter(d => d.statut === 'ouvert' || d.statut === 'en_cours').length

  const tableData = activeTab === 'disciplinaire'
    ? dossiers.filter(d => d.type !== 'distinction' && d.type !== 'felicitation')
    : distinctions

  const columns: { key: string; header: string; sortable?: boolean; render: (d: DossierDisciplinaire) => React.ReactNode }[] = [
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
      key: 'type',
      header: 'Type',
      render: d => (
        <Badge
          label={d.type === 'infraction' ? 'Infraction' : d.type === 'sanction' ? 'Sanction' : d.type === 'avertissement' ? 'Avertissement' : d.type === 'distinction' ? 'Distinction' : 'Félicitation'}
          variant={d.type === 'distinction' || d.type === 'felicitation' ? 'actif' : d.type === 'sanction' ? 'blesse' : 'en_attente'}
          dot
        />
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: d => (
        <span className="text-xs text-[#8fa88f] line-clamp-1">{d.description}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: d => <span className="text-[10px] text-[#8fa88f]">{new Date(d.date).toLocaleDateString('fr-FR')}</span>,
    },
    {
      key: 'statut',
      header: 'Statut',
      render: d => (
        <Badge
          label={d.statut === 'clos' ? 'Clos' : d.statut === 'en_cours' ? 'En cours' : d.statut === 'ouvert' ? 'Ouvert' : d.statut}
          variant={d.statut === 'clos' ? 'retraite' : d.statut === 'en_cours' ? 'mission' : 'en_attente'}
          dot
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Dossiers disciplinaires" subtitle="Infractions, sanctions et distinctions FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Infractions" value={isLoading ? '…' : infractions.length} icon={<AlertOctagon size={16} />} color="red" size="sm" />
          <StatCard title="Sanctions" value={isLoading ? '…' : sanctions.length} icon={<Shield size={16} />} color="yellow" size="sm" />
          <StatCard title="Cas ouverts" value={isLoading ? '…' : ouverts} icon={<Shield size={16} />} color="yellow" size="sm" />
          <StatCard title="Distinctions" value={isLoading ? '…' : distinctions.length} icon={<Award size={16} />} color="green" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center gap-4">
            {(['disciplinaire', 'distinctions'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all',
                  activeTab === tab
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'text-[#5a705a] hover:text-[#e8f0e8]'
                )}
              >
                {tab === 'disciplinaire' ? (
                  <span className="flex items-center gap-1"><Shield size={12} /> Disciplinaire</span>
                ) : (
                  <span className="flex items-center gap-1"><Star size={12} /> Distinctions</span>
                )}
              </button>
            ))}
            {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin ml-2" />}
          </div>
          <div className="p-4">
            <DataTable
              data={tableData}
              columns={columns}
              searchPlaceholder="Rechercher par nom, matricule..."
              pageSize={10}
              actions={(d: DossierDisciplinaire) => (
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
          subtitle={`Dossier ${selected.type} · ${new Date(selected.date).toLocaleDateString('fr-FR')}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Militaire', militaireNom(selected.militaire)],
                ['Matricule', militaireMatricule(selected.militaire)],
                ['Type', selected.type],
                ['Statut', selected.statut],
                ['Date', new Date(selected.date).toLocaleDateString('fr-FR')],
                ['Catégorie', selected.categorie ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">Description</div>
              <div className="text-xs text-[#e8f0e8]">{selected.description}</div>
            </div>
            {selected.faitsReproches && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">Faits reprochés</div>
                <div className="text-xs text-[#e8f0e8]">{selected.faitsReproches}</div>
              </div>
            )}
            {selected.sanction && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-red-500/20">
                <div className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Sanction</div>
                <div className="text-xs text-[#e8f0e8]">{selected.sanction.type}{selected.sanction.dureeJours ? ` · ${selected.sanction.dureeJours} jours` : ''}</div>
              </div>
            )}
            {selected.distinction && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-green-500/20">
                <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Distinction</div>
                <div className="text-xs text-[#e8f0e8]">{selected.distinction.intitule ?? selected.distinction.type}{selected.distinction.motif ? ` — ${selected.distinction.motif}` : ''}</div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
