'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import permissionsService, { type Permission } from '@/services/permissions.service'

const typeLabels: Record<string, string> = {
  conge_annuel: 'Congé annuel',
  conge_maladie: 'Congé maladie',
  permission_exceptionnelle: 'Permission exceptionnelle',
  repos_compensateur: 'Repos compensateur',
  conge_maternite: 'Congé maternité',
  conge_paternite: 'Congé paternité',
}

function militaireNom(m: Permission['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return `${m.nom} ${m.prenom}`
  return String(m)
}
function militaireMatricule(m: Permission['militaire']): string {
  if (!m) return '—'
  if (typeof m === 'object') return m.matricule
  return '—'
}
function uniteNom(u: Permission['unite']): string {
  if (!u) return '—'
  if (typeof u === 'object') return u.nom
  return String(u)
}
function approuvePar(a: Permission['approuvePar']): string {
  if (!a) return '—'
  if (typeof a === 'object') return `${a.nom} ${a.prenom}`
  return String(a)
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Permission | null>(null)
  const [filterStatut, setFilterStatut] = useState('')

  useEffect(() => {
    permissionsService.getAll({ limit: 200 })
      .then(res => setPermissions((res.data as Permission[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ permissions: mock }) => setPermissions(mock as unknown as Permission[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterStatut ? permissions.filter(p => p.statut === filterStatut) : permissions
  const approuvees = permissions.filter(p => p.statut === 'approuvee').length
  const enAttente = permissions.filter(p => p.statut === 'en_attente').length
  const refusees = permissions.filter(p => p.statut === 'refusee').length
  const enCours = permissions.filter(p => p.statut === 'en_cours').length

  const columns: { key: string; header: string; sortable?: boolean; render: (p: Permission) => React.ReactNode }[] = [
    {
      key: 'matricule',
      header: 'Matricule',
      render: p => <span className="font-mono text-[11px] text-green-400">{militaireMatricule(p.militaire)}</span>,
    },
    {
      key: 'militaire',
      header: 'Militaire',
      sortable: true,
      render: p => <span className="text-xs font-medium text-[#e8f0e8]">{militaireNom(p.militaire)}</span>,
    },
    {
      key: 'unite',
      header: 'Unité',
      render: p => <span className="font-mono text-xs text-[#8fa88f]">{uniteNom(p.unite)}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: p => <span className="text-xs text-[#e8f0e8]">{typeLabels[p.type] ?? p.type}</span>,
    },
    {
      key: 'dates',
      header: 'Période',
      render: p => (
        <div className="text-[10px] text-[#8fa88f]">
          <div>{new Date(p.dateDebut).toLocaleDateString('fr-FR')}</div>
          <div>→ {new Date(p.dateFin).toLocaleDateString('fr-FR')}</div>
        </div>
      ),
    },
    {
      key: 'nombreJours',
      header: 'Jours',
      sortable: true,
      render: p => <span className="text-xs font-bold text-[#e8f0e8]">{p.nombreJours ?? '—'}</span>,
    },
    {
      key: 'statut',
      header: 'Statut',
      render: p => (
        <Badge
          label={p.statut === 'approuvee' ? 'Approuvée' : p.statut === 'refusee' ? 'Refusée' : p.statut === 'en_cours' ? 'En cours' : 'En attente'}
          variant={p.statut === 'approuvee' || p.statut === 'en_cours' ? 'actif' : p.statut === 'refusee' ? 'retraite' : 'en_attente'}
          dot
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Permissions & Congés" subtitle="Gestion des absences autorisées FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Approuvées" value={isLoading ? '…' : approuvees} icon={<CheckCircle size={16} />} color="green" size="sm" />
          <StatCard title="En cours" value={isLoading ? '…' : enCours} icon={<Clock size={16} />} color="blue" size="sm" />
          <StatCard title="En attente" value={isLoading ? '…' : enAttente} icon={<Calendar size={16} />} color="yellow" size="sm" />
          <StatCard title="Refusées" value={isLoading ? '…' : refusees} icon={<XCircle size={16} />} color="red" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Registre des permissions</span>
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
                <option value="en_attente">En attente</option>
                <option value="approuvee">Approuvée</option>
                <option value="en_cours">En cours</option>
                <option value="refusee">Refusée</option>
              </select>
              <button type="button" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Plus size={13} />
                Nouvelle demande
              </button>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par nom, matricule..."
              pageSize={10}
              actions={(p: Permission) => (
                <button
                  type="button"
                  title="Voir détails"
                  onClick={() => setSelected(p)}
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
          title={`${typeLabels[selected.type] ?? selected.type}`}
          subtitle={`${militaireNom(selected.militaire)} · ${militaireMatricule(selected.militaire)}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Militaire', militaireNom(selected.militaire)],
              ['Matricule', militaireMatricule(selected.militaire)],
              ['Unité', uniteNom(selected.unite)],
              ['Type', typeLabels[selected.type] ?? selected.type],
              ['Date début', new Date(selected.dateDebut).toLocaleDateString('fr-FR')],
              ['Date fin', new Date(selected.dateFin).toLocaleDateString('fr-FR')],
              ['Nombre de jours', selected.nombreJours?.toString() ?? '—'],
              ['Statut', selected.statut],
              ['Approuvé par', approuvePar(selected.approuvePar)],
              ['Date approbation', selected.dateApprobation ? new Date(selected.dateApprobation).toLocaleDateString('fr-FR') : '—'],
            ].map(([l, v]) => (
              <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
              </div>
            ))}
            {selected.motif && (
              <div className="col-span-2 p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">Motif</div>
                <div className="text-xs text-[#e8f0e8]">{selected.motif}</div>
              </div>
            )}
            {selected.commentaireApprobation && (
              <div className="col-span-2 p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">Commentaire</div>
                <div className="text-xs text-[#e8f0e8]">{selected.commentaireApprobation}</div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
