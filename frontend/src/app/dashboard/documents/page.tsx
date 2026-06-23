'use client'

import { useState, useEffect } from 'react'
import { FileText, Shield, Lock, Eye, Download } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import documentsService, { type Document } from '@/services/documents.service'

const typeLabels: Record<string, string> = {
  ordre: 'Ordre', rapport: 'Rapport', directive: 'Directive',
  compte_rendu: 'Compte rendu', note: 'Note', procedure: 'Procédure', autre: 'Autre',
}

const classifConfig: Record<string, { label: string; color: string; bg: string }> = {
  public:             { label: 'Public',              color: 'text-green-400',  bg: 'bg-green-500/10' },
  confidentiel:       { label: 'Confidentiel',         color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  secret:             { label: 'Secret',               color: 'text-orange-400', bg: 'bg-orange-500/10' },
  tres_secret:        { label: 'Très secret',          color: 'text-red-400',    bg: 'bg-red-500/10' },
  ultra_confidentiel: { label: 'Ultra confidentiel',   color: 'text-red-600',    bg: 'bg-red-900/20' },
}

function auteurLabel(a: Document['auteur']): string {
  if (!a) return '—'
  if (typeof a === 'object') return `${a.nom} ${a.prenom}`
  return String(a)
}
function uniteLabel(u: Document['unite']): string {
  if (!u) return '—'
  if (typeof u === 'object') return u.nom
  return String(u)
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Document | null>(null)
  const [filterClassif, setFilterClassif] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    documentsService.getAll({ limit: 200 })
      .then(res => setDocuments((res.data as Document[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ documents: mock }) => setDocuments(mock as unknown as Document[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  let filtered = documents
  if (filterClassif) filtered = filtered.filter(d => d.classification === filterClassif)
  if (filterType) filtered = filtered.filter(d => d.type === filterType)

  const secrets = documents.filter(d => ['secret', 'tres_secret', 'ultra_confidentiel'].includes(d.classification)).length
  const actifs = documents.filter(d => d.statut === 'actif').length

  const columns: { key: string; header: string; sortable?: boolean; render: (d: Document) => React.ReactNode }[] = [
    {
      key: 'numero',
      header: 'Numéro',
      render: d => <span className="font-mono text-[11px] text-green-400">{d.numero}</span>,
    },
    {
      key: 'titre',
      header: 'Titre',
      sortable: true,
      render: d => (
        <div>
          <div className="text-xs font-medium text-[#e8f0e8] line-clamp-1">{d.titre}</div>
          <div className="text-[10px] text-[#5a705a]">{typeLabels[d.type] ?? d.type}{d.version ? ` · v${d.version}` : ''}</div>
        </div>
      ),
    },
    {
      key: 'unite',
      header: 'Unité',
      render: d => <span className="font-mono text-xs text-[#8fa88f]">{uniteLabel(d.unite)}</span>,
    },
    {
      key: 'classification',
      header: 'Classification',
      render: d => {
        const cfg = classifConfig[d.classification] ?? classifConfig.public
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} border-current/20 flex items-center gap-1 w-fit`}>
            <Lock size={9} />
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'auteur',
      header: 'Auteur',
      render: d => <span className="text-xs text-[#8fa88f]">{auteurLabel(d.auteur)}</span>,
    },
    {
      key: 'dateDocument',
      header: 'Date',
      sortable: true,
      render: d => (
        <span className="text-[10px] text-[#8fa88f]">
          {d.dateDocument ? new Date(d.dateDocument).toLocaleDateString('fr-FR') : '—'}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: d => (
        <Badge
          label={d.statut === 'actif' ? 'Actif' : d.statut === 'archive' ? 'Archivé' : d.statut}
          variant={d.statut === 'actif' ? 'actif' : 'retraite'}
          dot
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Gestion documentaire" subtitle="Documents officiels et archives FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total documents" value={isLoading ? '…' : documents.length} icon={<FileText size={16} />} color="green" size="sm" />
          <StatCard title="Actifs" value={isLoading ? '…' : actifs} icon={<Shield size={16} />} color="green" size="sm" />
          <StatCard title="Classifiés secret" value={isLoading ? '…' : secrets} icon={<Lock size={16} />} color="red" size="sm" />
          <StatCard title="Vues totales" value={isLoading ? '…' : documents.reduce((s, d) => s + (d.nombreVues ?? 0), 0)} icon={<Eye size={16} />} color="blue" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Registre documentaire</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                aria-label="Filtrer par classification"
                value={filterClassif}
                onChange={e => setFilterClassif(e.target.value)}
                className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none"
              >
                <option value="">Toutes classifications</option>
                {Object.entries(classifConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
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
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par titre, numéro..."
              pageSize={10}
              actions={(d: Document) => (
                <div className="flex gap-1">
                  <button
                    type="button"
                    title="Voir document"
                    onClick={() => setSelected(d)}
                    className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all"
                  >
                    <Eye size={14} />
                  </button>
                  {d.fichiers && d.fichiers.length > 0 && (
                    <button
                      type="button"
                      title="Télécharger"
                      className="p-1.5 rounded-lg text-[#5a705a] hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Download size={14} />
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.titre}
          subtitle={`${selected.numero} · ${typeLabels[selected.type] ?? selected.type}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Numéro', selected.numero],
                ['Type', typeLabels[selected.type] ?? selected.type],
                ['Classification', classifConfig[selected.classification]?.label ?? selected.classification],
                ['Version', selected.version ?? '1.0'],
                ['Auteur', auteurLabel(selected.auteur)],
                ['Unité', uniteLabel(selected.unite)],
                ['Date document', selected.dateDocument ? new Date(selected.dateDocument).toLocaleDateString('fr-FR') : '—'],
                ['Date validité', selected.dateValidite ? new Date(selected.dateValidite).toLocaleDateString('fr-FR') : '—'],
                ['Statut', selected.statut],
                ['Vues', String(selected.nombreVues ?? 0)],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            {selected.tags && selected.tags.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a261a] border border-[#1e321e] text-[#8fa88f]">{t}</span>
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
