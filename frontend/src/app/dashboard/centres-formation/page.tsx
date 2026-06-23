'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Users, BookOpen, Award, MapPin, Eye, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import centresService, { type CentreFormation } from '@/services/centres.service'
import { clsx } from 'clsx'

const statutConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  actif:      { label: 'Actif',       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  dot: 'bg-green-400' },
  renovation: { label: 'Rénovation',  color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  inactif:    { label: 'Inactif',     color: 'text-gray-400',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30',   dot: 'bg-gray-400' },
  ferme:      { label: 'Fermé',       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    dot: 'bg-red-400' },
}

const categorieLabel: Record<string, string> = {
  formation_initiale_recrue:       'Formation recrue',
  formation_initiale_officier:     'Formation officier',
  formation_initiale_sous_officier:'Formation sous-officier',
  forces_terrestres:               'Forces terrestres',
  forces_speciales:                'Forces spéciales',
  forces_aeriennes:                'Forces aériennes',
  forces_navales:                  'Forces navales',
  renseignement:                   'Renseignement',
  cyberdefense:                    'Cyberdéfense',
  logistique:                      'Logistique',
  sante_militaire:                 'Santé militaire',
  genie_militaire:                 'Génie militaire',
  transmissions:                   'Transmissions',
  commandement:                    'Commandement',
  leadership:                      'Leadership',
  gestion_crises:                  'Gestion de crises',
  formation_continue:              'Formation continue',
}

function refNom(ref: CentreFormation['zone']): string {
  if (!ref) return '—'
  if (typeof ref === 'object') return ref.nom
  return String(ref)
}

export default function CentresFormationPage() {
  const [centres, setCentres] = useState<CentreFormation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<CentreFormation | null>(null)
  const [filterStatut, setFilterStatut] = useState('')

  useEffect(() => {
    centresService.getAll({ limit: 50 })
      .then(res => setCentres((res.data as CentreFormation[]) ?? []))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterStatut ? centres.filter(c => c.statut === filterStatut) : centres
  const totalCapacite = centres.reduce((s, c) => s + c.capaciteAccueil, 0)
  const totalStagiaires = centres.reduce((s, c) => s + (c.statistiques?.stagiairesCourants ?? 0), 0)
  const totalFormations = centres.reduce((s, c) => s + (c.statistiques?.formationsEnCours ?? 0), 0)
  const totalDiplomes = centres.reduce((s, c) => s + (c.statistiques?.diplomesCetteAnnee ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Centres de Formation Militaires"
        subtitle="FARDC · Formation initiale, spécialisée & continue"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Centres actifs" value={isLoading ? '…' : centres.length} icon={<GraduationCap size={16} />} color="blue" size="sm" />
          <StatCard title="Stagiaires en cours" value={isLoading ? '…' : totalStagiaires} icon={<Users size={16} />} color="green" size="sm" />
          <StatCard title="Formations actives" value={isLoading ? '…' : totalFormations} icon={<BookOpen size={16} />} color="green" size="sm" />
          <StatCard title="Diplômés cette année" value={isLoading ? '…' : totalDiplomes} icon={<Award size={16} />} color="blue" size="sm" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['', 'actif', 'renovation', 'inactif', 'ferme'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatut(s)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                filterStatut === s
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8]'
              )}
            >
              {s === '' ? 'Tous' : statutConfig[s]?.label ?? s}
            </button>
          ))}
          <div className="ml-auto text-[10px] text-[#5a705a]">
            Capacité totale: <span className="text-[#e8f0e8] font-semibold">{totalCapacite.toLocaleString('fr-FR')}</span> stagiaires
          </div>
          {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(centre => {
            const cfg = statutConfig[centre.statut] ?? statutConfig.actif
            return (
              <div
                key={centre._id}
                className={clsx('bg-[#141e14] border rounded-xl overflow-hidden hover:border-green-500/30 transition-all', cfg.border)}
              >
                {/* Card header */}
                <div className={clsx('px-4 py-3 border-b flex items-center justify-between', cfg.border, cfg.bg)}>
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                    <span className={clsx('text-xs font-semibold', cfg.color)}>{cfg.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5a705a]">{centre.code}</span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#e8f0e8] leading-tight">{centre.nom}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={10} className="text-[#5a705a] flex-shrink-0" />
                        <p className="text-[10px] text-[#5a705a]">
                          {centre.ville ?? centre.province}
                          {centre.force && ` · ${centre.force.toUpperCase()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Voir détails"
                      onClick={() => setSelected(centre)}
                      className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all flex-shrink-0"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { icon: <Users size={12} />, label: 'Stagiaires', value: centre.statistiques?.stagiairesCourants ?? 0 },
                      { icon: <GraduationCap size={12} />, label: 'Instructeurs', value: centre.statistiques?.instructeursActifs ?? 0 },
                      { icon: <BookOpen size={12} />, label: 'Formations', value: centre.statistiques?.formationsEnCours ?? 0 },
                      { icon: <Award size={12} />, label: 'Diplômés', value: centre.statistiques?.diplomesCetteAnnee ?? 0 },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2 p-2 bg-[#0a110a] rounded-lg border border-[#1e321e]">
                        <div className="text-[#5a705a] flex-shrink-0">{icon}</div>
                        <div>
                          <div className="text-xs font-bold text-[#e8f0e8]">{value}</div>
                          <div className="text-[9px] text-[#5a705a]">{label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Capacité bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[9px] text-[#5a705a] mb-1">
                      <span>Taux d&apos;occupation</span>
                      <span>{centre.capaciteAccueil > 0
                        ? `${Math.round(((centre.statistiques?.stagiairesCourants ?? 0) / centre.capaciteAccueil) * 100)}%`
                        : '—'
                      }</span>
                    </div>
                    <div className="w-full bg-[#1e321e] rounded-full h-1">
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all"
                        style={{ width: `${Math.min(100, centre.capaciteAccueil > 0 ? ((centre.statistiques?.stagiairesCourants ?? 0) / centre.capaciteAccueil) * 100 : 0)}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-[#5a705a] mt-0.5">Capacité max: {centre.capaciteAccueil} stagiaires</div>
                  </div>

                  {/* Catégories de formation */}
                  {centre.categoriesFormation && centre.categoriesFormation.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {centre.categoriesFormation.slice(0, 3).map(cat => (
                        <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a261a] border border-[#1e321e] text-[#8fa88f]">
                          {categorieLabel[cat] ?? cat}
                        </span>
                      ))}
                      {centre.categoriesFormation.length > 3 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a261a] border border-[#1e321e] text-[#5a705a]">
                          +{centre.categoriesFormation.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {!isLoading && filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-xs text-[#5a705a]">Aucun centre de formation trouvé</div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.nom}
          subtitle={`${selected.code} · ${selected.province}${selected.ville ? ` / ${selected.ville}` : ''}`}
          size="lg"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Code', selected.code],
                ['Statut', statutConfig[selected.statut]?.label ?? selected.statut],
                ['Province', selected.province],
                ['Ville', selected.ville ?? '—'],
                ['Zone', refNom(selected.zone)],
                ['Région', refNom(selected.region)],
                ['Force', selected.force?.toUpperCase() ?? '—'],
                ['Capacité d\'accueil', selected.capaciteAccueil.toLocaleString('fr-FR')],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>

            {selected.statistiques && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  ['Stagiaires', selected.statistiques.stagiairesCourants ?? 0],
                  ['Instructeurs', selected.statistiques.instructeursActifs ?? 0],
                  ['Formations', selected.statistiques.formationsEnCours ?? 0],
                  ['Diplômés', selected.statistiques.diplomesCetteAnnee ?? 0],
                ].map(([l, v]) => (
                  <div key={String(l)} className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                    <div className="text-lg font-bold text-green-400">{Number(v).toLocaleString('fr-FR')}</div>
                    <div className="text-[9px] text-[#5a705a]">{l}</div>
                  </div>
                ))}
              </div>
            )}

            {selected.categoriesFormation && selected.categoriesFormation.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Catégories de formation</div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.categoriesFormation.map(cat => (
                    <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      {categorieLabel[cat] ?? cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selected.infrastructures && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Infrastructures</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {[
                    ['Salles de classe', selected.infrastructures.sallesDeClasse],
                    ['Terrains de tir', selected.infrastructures.terrainsTir],
                    ['Parcours combat', selected.infrastructures.parcoursCombat],
                    ['Simulateurs', selected.infrastructures.simulateurs],
                    ['Dortoirs', selected.infrastructures.dormitoires],
                    ['Hébergement', selected.infrastructures.capaciteHebergement],
                  ].filter(([, v]) => v != null && v !== 0).map(([l, v]) => (
                    <div key={String(l)} className="flex items-center justify-between text-[10px]">
                      <span className="text-[#5a705a]">{l}</span>
                      <span className="text-[#e8f0e8] font-semibold">{v}</span>
                    </div>
                  ))}
                  {[
                    ['Infirmerie', selected.infrastructures.infirmerie],
                    ['Bibliothèque', selected.infrastructures.bibliotheque],
                    ['Informatique', selected.infrastructures.centre_informatique],
                    ['Piscine', selected.infrastructures.piscine],
                  ].filter(([, v]) => v).map(([l]) => (
                    <div key={String(l)} className="flex items-center gap-1 text-[10px] text-green-400">
                      <CheckCircle size={10} />
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.localisation?.coordonnees && (
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Coordonnées GPS</div>
                <div className="text-xs font-mono text-green-400">
                  {selected.localisation.coordonnees.lat.toFixed(4)}°, {selected.localisation.coordonnees.lng.toFixed(4)}°
                </div>
                {selected.localisation.adresse && (
                  <div className="text-[10px] text-[#5a705a] mt-1">{selected.localisation.adresse}</div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
