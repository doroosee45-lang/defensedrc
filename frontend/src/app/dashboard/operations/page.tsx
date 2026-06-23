'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target, Plus, MapPin, Users, Calendar, Activity, Eye, Flag, Crosshair } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import operationsService, { type Mission } from '@/services/operations.service'

const typeLabels: Record<string, string> = {
  patrouille: 'Patrouille',
  securisation: 'Sécurisation',
  offensive: 'Opération Offensive',
  humanitaire: 'Humanitaire',
  formation: 'Formation',
  reconnaissance: 'Reconnaissance',
  soutien: 'Soutien',
}

const typeIcon: Record<string, React.ReactNode> = {
  patrouille: <MapPin size={14} />,
  securisation: <Flag size={14} />,
  offensive: <Crosshair size={14} />,
  humanitaire: <Activity size={14} />,
  formation: <Users size={14} />,
}

function commandantNom(c: Mission['commandant']): string {
  if (!c) return '—'
  if (typeof c === 'object') return `${c.nom} ${c.prenom}`
  return String(c)
}

export default function OperationsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Mission | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatut, setFilterStatut] = useState('')

  const fetchMissions = useCallback(() => {
    setIsLoading(true)
    operationsService.getAll({ limit: 100 })
      .then(res => setMissions((res.data as Mission[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ missions: mock }) => setMissions(mock as unknown as Mission[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetchMissions() }, [fetchMissions])

  const filtered = filterStatut ? missions.filter(m => m.statut === filterStatut) : missions
  const enCours = missions.filter(m => m.statut === 'en_cours')
  const terminees = missions.filter(m => m.statut === 'terminee')
  const totalPersonnel = enCours.reduce((s, m) => s + (m.personnelAssigne?.length ?? 0), 0)
  const totalMorts = enCours.reduce((s, m) => s + (m.resultats?.morts ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      <Header title="Opérations & Missions" subtitle="Gestion et suivi des opérations militaires FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Missions en cours" value={isLoading ? '…' : enCours.length} icon={<Target size={16} />} color="blue" size="sm" />
          <StatCard title="Personnel engagé" value={isLoading ? '…' : totalPersonnel} icon={<Users size={16} />} color="green" size="sm" />
          <StatCard title="Missions terminées" value={isLoading ? '…' : terminees.length} icon={<Flag size={16} />} color="gray" size="sm" />
          <StatCard title="Pertes signalées" value={isLoading ? '…' : totalMorts} icon={<Activity size={16} />} color="red" size="sm" />
        </div>

        {/* Header bar */}
        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Registre des opérations</span>
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
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="suspendue">Suspendue</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
              <button type="button" onClick={() => setShowAdd(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Plus size={13} />
                Nouvelle mission
              </button>
            </div>
          </div>

          {/* Mission cards */}
          <div className="p-4 space-y-3">
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-12 text-xs text-[#5a705a]">Aucune mission trouvée</div>
            )}
            {filtered.map(m => (
              <div key={m._id} className="border border-[#1e321e] rounded-xl overflow-hidden hover:border-green-500/30 transition-all">
                <div className={`h-0.5 w-full ${m.priorite === 'critique' ? 'bg-red-500' : m.priorite === 'haute' ? 'bg-orange-500' : 'bg-green-500/50'}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono text-[#5a705a]">{m.code}</span>
                        {typeIcon[m.type] && <span className="text-[#5a705a]">{typeIcon[m.type]}</span>}
                        <Badge label={typeLabels[m.type] ?? m.type} variant="mission" size="xs" />
                        <Badge label={m.priorite === 'critique' ? 'Critique' : m.priorite === 'haute' ? 'Haute' : 'Normale'} variant={m.priorite as 'critique' | 'haute' | 'basse'} size="xs" />
                      </div>
                      <h3 className="text-sm font-bold text-[#e8f0e8]">{m.nom}</h3>
                      {m.objectifs?.[0] && <p className="text-xs text-[#5a705a] mt-1 line-clamp-2">{m.objectifs[0]}</p>}
                    </div>
                    <div className="flex-shrink-0">
                      <Badge
                        label={m.statut === 'en_cours' ? 'En cours' : m.statut === 'terminee' ? 'Terminée' : m.statut === 'planifiee' ? 'Planifiée' : m.statut}
                        variant={m.statut === 'en_cours' ? 'mission' : m.statut === 'terminee' ? 'retraite' : 'en_attente'}
                        dot
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {m.zoneOperation?.province && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8fa88f]">
                        <MapPin size={12} className="text-[#5a705a]" />
                        {m.zoneOperation.province}
                      </div>
                    )}
                    {m.personnelAssigne && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8fa88f]">
                        <Users size={12} className="text-[#5a705a]" />
                        {m.personnelAssigne.length.toLocaleString('fr-FR')} assignés
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8fa88f]">
                      <Calendar size={12} className="text-[#5a705a]" />
                      Depuis le {new Date(m.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                    {m.commandant && (
                      <div className="text-[11px] text-[#5a705a]">Cmd : {commandantNom(m.commandant)}</div>
                    )}
                    {(m.resultats?.morts || m.resultats?.blesses) ? (
                      <div className="flex items-center gap-2 ml-auto">
                        {(m.resultats.morts ?? 0) > 0 && (
                          <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                            {m.resultats.morts} pertes
                          </span>
                        )}
                        {(m.resultats.blesses ?? 0) > 0 && (
                          <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/30">
                            {m.resultats.blesses} blessés
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-end mt-3">
                    <button type="button" onClick={() => setSelected(m)} className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                      <Eye size={13} />
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.nom}
          subtitle={selected.code}
          size="xl"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                ['Statut', <Badge key="s" label={selected.statut} variant={selected.statut === 'en_cours' ? 'mission' : 'retraite'} dot />],
                ['Type', typeLabels[selected.type] ?? selected.type],
                ['Province', selected.zoneOperation?.province ?? '—'],
                ['Responsable', commandantNom(selected.commandant)],
                ['Personnel assigné', (selected.personnelAssigne?.length ?? 0).toString()],
                ['Priorité', selected.priorite ?? '—'],
                ['Date de début', new Date(selected.dateDebut).toLocaleDateString('fr-FR')],
                ['Date de fin prévue', selected.dateFinPrevue ? new Date(selected.dateFinPrevue).toLocaleDateString('fr-FR') : '—'],
                ['Durée (jours)', selected.dureeJours?.toString() ?? '—'],
              ].map(([l, v]) => (
                <div key={String(l)} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-sm font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
              {(selected.resultats?.morts ?? 0) > 0 && (
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Pertes au combat</div>
                  <div className="text-sm font-bold text-red-400">{selected.resultats?.morts}</div>
                </div>
              )}
              {(selected.resultats?.blesses ?? 0) > 0 && (
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <div className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Blessés</div>
                  <div className="text-sm font-bold text-orange-400">{selected.resultats?.blesses}</div>
                </div>
              )}
            </div>
            {selected.objectifs && selected.objectifs.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Objectifs opérationnels</div>
                <ul className="space-y-1">
                  {selected.objectifs.map((o, i) => (
                    <li key={i} className="text-xs text-[#e8f0e8] flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">·</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selected.zoneOperation && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Zone d'intervention</div>
                <p className="text-xs text-[#e8f0e8]">
                  {[selected.zoneOperation.nom, selected.zoneOperation.territoire, selected.zoneOperation.province].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}
            {selected.unitesPrincipales && selected.unitesPrincipales.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Unités principales</div>
                <div className="flex flex-wrap gap-2">
                  {selected.unitesPrincipales.map(u => (
                    <span key={u._id} className="text-[11px] font-mono bg-green-500/10 text-green-400 border border-green-500/30 px-2 py-1 rounded-lg">{u.code}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Créer une nouvelle mission"
        size="xl"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => setShowAdd(false)}>Annuler</button>
            <button type="button" className="btn-primary text-xs" onClick={() => setShowAdd(false)}>Créer la mission</button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Nom de la mission</label><input className="mil-input" placeholder="Opération XXX" /></div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Type</label>
            <select aria-label="Type de mission" className="mil-select">
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Province</label><input className="mil-input" placeholder="Province concernée" /></div>
          <div><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Officier commandant</label><input className="mil-input" placeholder="Matricule ou nom" /></div>
          <div><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Date de début</label><input type="date" aria-label="Date de début" className="mil-input" /></div>
          <div><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Date de fin prévue</label><input type="date" aria-label="Date de fin prévue" className="mil-input" /></div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Priorité</label>
            <select aria-label="Priorité" className="mil-select">
              <option value="normale">Normale</option>
              <option value="haute">Haute</option>
              <option value="critique">Critique</option>
            </select>
          </div>
          <div><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Classification</label><input className="mil-input" placeholder="SECRET, CONFIDENTIEL..." /></div>
          <div className="col-span-2"><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Zone d'intervention</label><input className="mil-input" placeholder="Description géographique de la zone" /></div>
          <div className="col-span-2"><label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Objectif opérationnel</label><textarea className="mil-input h-24 resize-none" placeholder="Description détaillée des objectifs..." /></div>
        </div>
      </Modal>
    </div>
  )
}
