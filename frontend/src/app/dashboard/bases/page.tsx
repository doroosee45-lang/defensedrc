'use client'

import { useState, useEffect } from 'react'
import { Building2, Shield, Users, Package, Truck, AlertTriangle, CheckCircle, Eye, MapPin, AlertOctagon } from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import basesService, { type BaseMilitaire } from '@/services/bases.service'
import { clsx } from 'clsx'

const securiteConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: React.ReactNode }> = {
  securisee:        { label: 'Sécurisée',       color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  dot: 'bg-green-400',          icon: <CheckCircle size={12} /> },
  sous_surveillance:{ label: 'Sous surveillance',color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400',         icon: <AlertTriangle size={12} /> },
  compromise:       { label: 'Compromise',       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/40',    dot: 'bg-red-500 animate-pulse',icon: <AlertOctagon size={12} /> },
  evacuee:          { label: 'Évacuée',          color: 'text-red-600',    bg: 'bg-red-900/20',    border: 'border-red-700/40',    dot: 'bg-red-700',            icon: <AlertOctagon size={12} /> },
}

const typeLabel: Record<string, string> = {
  base_principale:   'Base principale',
  base_avancee:      'Base avancée',
  centre_formation:  'Centre de formation',
  depot_logistique:  'Dépôt logistique',
  poste_observation: "Poste d'observation",
}

function cmdLabel(c: BaseMilitaire['commandant']): string {
  if (!c) return '—'
  if (typeof c === 'object') return `${c.nom} ${c.prenom}`
  return String(c)
}

export default function BasesPage() {
  const [bases, setBases] = useState<BaseMilitaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<BaseMilitaire | null>(null)
  const [filterForce, setFilterForce] = useState('')

  useEffect(() => {
    basesService.getAll({ limit: 100 })
      .then(res => setBases((res.data as BaseMilitaire[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ basesMilitaires: mock }) => setBases(mock as unknown as BaseMilitaire[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = filterForce ? bases.filter(b => b.force === filterForce) : bases
  const securisees = bases.filter(b => b.niveauSecurite === 'securisee').length
  const menacees = bases.filter(b => ['compromise', 'evacuee', 'sous_surveillance'].includes(b.niveauSecurite)).length
  const totalPersonnel = bases.reduce((s, b) => s + (b.effectifTotal ?? 0), 0)

  return (
    <div className="flex flex-col h-full">
      <Header title="Bases & Installations militaires" subtitle="Infrastructure FARDC · Sécurité et logistique" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total bases" value={isLoading ? '…' : bases.length} icon={<Building2 size={16} />} color="green" size="sm" />
          <StatCard title="Personnel logé" value={isLoading ? '…' : totalPersonnel.toLocaleString('fr-FR')} icon={<Users size={16} />} color="blue" size="sm" />
          <StatCard title="Sécurisées" value={isLoading ? '…' : securisees} icon={<CheckCircle size={16} />} color="green" size="sm" />
          <StatCard title="Menacées" value={isLoading ? '…' : menacees} icon={<AlertTriangle size={16} />} color="red" size="sm" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'terrestre', 'aerienne', 'maritime', 'emg'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterForce(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                filterForce === f
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8]'
              )}
            >
              {f === '' ? 'Toutes forces' : f === 'emg' ? 'EMG' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin ml-2" />}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(b => {
            const sec = securiteConfig[b.niveauSecurite] ?? securiteConfig.securisee
            return (
              <div
                key={b._id}
                className={clsx('bg-[#141e14] border rounded-xl overflow-hidden hover:border-green-500/30 transition-all', sec.border)}
              >
                <div className={clsx('px-4 py-3 border-b flex items-center justify-between', sec.border)}>
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', sec.dot)} />
                    <span className={clsx('text-xs font-semibold', sec.color)}>{sec.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5a705a]">{b.code}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#e8f0e8]">{b.nom}</h3>
                      <p className="text-[10px] text-[#5a705a] mt-0.5">{typeLabel[b.type] ?? b.type} · {b.force?.toUpperCase()}</p>
                    </div>
                    <button
                      type="button"
                      title="Voir détails"
                      onClick={() => setSelected(b)}
                      className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all flex-shrink-0"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#5a705a] mb-3">
                    <MapPin size={10} />
                    {b.localisation.province}{b.localisation.territoire ? ` · ${b.localisation.territoire}` : ''}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: <Users size={12} />, label: 'Personnel', value: b.effectifTotal ?? '—' },
                      { icon: <Truck size={12} />, label: 'Véhicules', value: b.capacite?.vehicules ?? '—' },
                      { icon: <Package size={12} />, label: 'Capacité', value: b.capacite?.personnel ?? '—' },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="text-center p-2 bg-[#0a110a] rounded-lg border border-[#1e321e]">
                        <div className="text-[#5a705a] flex justify-center mb-1">{icon}</div>
                        <div className="text-xs font-bold text-[#e8f0e8]">{String(value)}</div>
                        <div className="text-[9px] text-[#5a705a]">{label}</div>
                      </div>
                    ))}
                  </div>
                  {b.stocks && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {b.stocks.munitionsStatut && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a261a] border border-[#1e321e] text-[#8fa88f] flex items-center gap-1">
                          <Shield size={9} /> Munitions: {b.stocks.munitionsStatut}
                        </span>
                      )}
                      {b.stocks.carburantLitres != null && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a261a] border border-[#1e321e] text-[#8fa88f]">
                          {b.stocks.carburantLitres.toLocaleString()} L carburant
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {!isLoading && filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-xs text-[#5a705a]">Aucune base trouvée</div>
          )}
        </div>
      </div>

      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.nom}
          subtitle={`${typeLabel[selected.type] ?? selected.type} · ${selected.code}`}
          size="lg"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Code', selected.code],
                ['Type', typeLabel[selected.type] ?? selected.type],
                ['Force', selected.force?.toUpperCase() ?? '—'],
                ['Statut', selected.statut],
                ['Niveau sécurité', securiteConfig[selected.niveauSecurite]?.label ?? selected.niveauSecurite],
                ['Commandant', cmdLabel(selected.commandant)],
                ['Province', selected.localisation.province],
                ['Localisation', selected.localisation.adresse ?? selected.localisation.territoire ?? '—'],
                ['Effectif total', (selected.effectifTotal ?? 0).toLocaleString('fr-FR')],
                ['Capacité personnel', (selected.capacite?.personnel ?? 0).toString()],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            {selected.effectifActuel && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Répartition effectif</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Officiers', selected.effectifActuel.officiers ?? 0],
                    ['Sous-officiers', selected.effectifActuel.sousOfficiers ?? 0],
                    ['Soldats', selected.effectifActuel.soldats ?? 0],
                  ].map(([l, v]) => (
                    <div key={String(l)} className="p-2 bg-[#141e14] rounded-lg border border-[#1e321e]">
                      <div className="text-sm font-bold text-green-400">{String(v)}</div>
                      <div className="text-[10px] text-[#5a705a]">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selected.localisation.coordonnees && (
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Coordonnées GPS</div>
                <div className="text-xs font-mono text-green-400">
                  {selected.localisation.coordonnees.lat.toFixed(4)}°, {selected.localisation.coordonnees.lng.toFixed(4)}°
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
