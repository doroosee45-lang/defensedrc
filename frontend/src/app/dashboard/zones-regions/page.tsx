'use client'

import { useState, useEffect } from 'react'
import { Globe, MapPin, AlertTriangle, CheckCircle, ChevronDown, ChevronRight, Eye } from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import zonesService, { regionsService, type ZoneMilitaire, type RegionMilitaire } from '@/services/zones.service'
import { clsx } from 'clsx'

const alerteConfig: Record<string, { label: string; color: string; dot: string }> = {
  normal:     { label: 'Normal',    color: 'text-green-400',  dot: 'bg-green-400' },
  vigilance:  { label: 'Vigilance', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  alerte:     { label: 'Alerte',    color: 'text-orange-400', dot: 'bg-orange-400 animate-pulse' },
  urgence:    { label: 'Urgence',   color: 'text-red-400',    dot: 'bg-red-500 animate-pulse' },
}

function zoneNom(z: RegionMilitaire['zone']): string {
  if (!z) return '—'
  if (typeof z === 'object') return z.nom
  return String(z)
}

export default function ZonesRegionsPage() {
  const [zones, setZones] = useState<ZoneMilitaire[]>([])
  const [regions, setRegions] = useState<RegionMilitaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set())
  const [selectedZone, setSelectedZone] = useState<ZoneMilitaire | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionMilitaire | null>(null)

  useEffect(() => {
    Promise.all([
      zonesService.getAll({ limit: 20 }),
      regionsService.getAll({ limit: 50 }),
    ])
      .then(([zRes, rRes]) => {
        const z = (zRes.data as ZoneMilitaire[]) ?? []
        const r = (rRes.data as RegionMilitaire[]) ?? []
        setZones(z)
        setRegions(r)
        // Expand all zones by default
        setExpandedZones(new Set(z.map(zone => zone._id)))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const toggleZone = (id: string) => {
    setExpandedZones(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const regionsForZone = (zoneId: string) =>
    regions.filter(r => {
      if (typeof r.zone === 'object') return r.zone._id === zoneId
      return r.zone === zoneId
    })

  const totalProvinces = zones.reduce((s, z) => s + z.nombreProvinces, 0)
  const totalMilitaires = zones.reduce((s, z) => s + z.nombreMilitaires, 0)
  const enAlerte = zones.filter(z => ['alerte', 'urgence'].includes(z.niveauAlerte)).length

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Zones & Régions Militaires"
        subtitle="Structure territoriale FARDC · 3 zones · 10 régions · 26 provinces"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Zones militaires" value={isLoading ? '…' : zones.length} icon={<Globe size={16} />} color="blue" size="sm" />
          <StatCard title="Régions militaires" value={isLoading ? '…' : regions.length} icon={<MapPin size={16} />} color="green" size="sm" />
          <StatCard title="Provinces couvertes" value={isLoading ? '…' : totalProvinces} icon={<CheckCircle size={16} />} color="green" size="sm" />
          <StatCard title="En alerte" value={isLoading ? '…' : enAlerte} icon={<AlertTriangle size={16} />} color="red" size="sm" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map(zone => {
              const zoneRegions = regionsForZone(zone._id)
              const alerte = alerteConfig[zone.niveauAlerte] ?? alerteConfig.normal
              const isExpanded = expandedZones.has(zone._id)

              return (
                <div key={zone._id} className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
                  {/* Zone header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1a261a] transition-colors"
                    onClick={() => toggleZone(zone._id)}
                  >
                    <div className="text-[#5a705a]">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Globe size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#e8f0e8]">{zone.nom}</span>
                        <span className="text-[10px] font-mono text-[#5a705a] bg-[#0a110a] px-1.5 py-0.5 rounded border border-[#1e321e]">{zone.code}</span>
                        <div className="flex items-center gap-1">
                          <div className={clsx('w-1.5 h-1.5 rounded-full', alerte.dot)} />
                          <span className={clsx('text-[10px]', alerte.color)}>{alerte.label}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-[#5a705a] mt-0.5">
                        QG: {zone.quartierGeneral} · {zone.nombreRegions} régions · {zone.nombreProvinces} provinces
                        {zone.nombreMilitaires > 0 && ` · ${zone.nombreMilitaires.toLocaleString('fr-FR')} militaires`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelectedZone(zone) }}
                      className="p-1.5 rounded-lg text-[#5a705a] hover:text-blue-400 hover:bg-blue-500/10 transition-all flex-shrink-0"
                    >
                      <Eye size={14} />
                    </button>
                  </div>

                  {/* Regions under zone */}
                  {isExpanded && (
                    <div className="border-t border-[#1e321e] divide-y divide-[#1e321e]">
                      {zoneRegions.length === 0 ? (
                        <div className="px-12 py-3 text-xs text-[#5a705a]">Aucune région chargée</div>
                      ) : (
                        zoneRegions.map(region => {
                          const rAlerte = alerteConfig[region.niveauAlerte] ?? alerteConfig.normal
                          return (
                            <div
                              key={region._id}
                              className="flex items-center gap-3 px-4 py-3 pl-12 hover:bg-[#0f1a0f] transition-colors group"
                            >
                              <div className="w-6 h-6 rounded bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                                <MapPin size={10} className="text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-semibold text-[#e8f0e8]">{region.nom}</span>
                                  <span className="text-[9px] font-mono text-[#5a705a]">{region.code}</span>
                                  <div className="flex items-center gap-1">
                                    <div className={clsx('w-1.5 h-1.5 rounded-full', rAlerte.dot)} />
                                    <span className={clsx('text-[9px]', rAlerte.color)}>{rAlerte.label}</span>
                                  </div>
                                </div>
                                <div className="text-[9px] text-[#5a705a] mt-0.5">
                                  {region.quartierGeneral && `QG: ${region.quartierGeneral} · `}
                                  Provinces: {region.provinces.join(', ')}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-[#5a705a] flex-shrink-0">
                                {region.statistiques?.militaires != null && region.statistiques.militaires > 0 && (
                                  <span>{region.statistiques.militaires.toLocaleString('fr-FR')} mil.</span>
                                )}
                                {region.statistiques?.bases != null && region.statistiques.bases > 0 && (
                                  <span>{region.statistiques.bases} bases</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedRegion(region)}
                                className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {zones.length === 0 && (
              <div className="text-center py-12 text-xs text-[#5a705a]">Aucune zone militaire trouvée</div>
            )}
          </div>
        )}

        {/* Summary table */}
        {!isLoading && regions.length > 0 && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e]">
              <h3 className="text-xs font-bold text-[#e8f0e8] uppercase tracking-wider">Couverture provinciale — toutes régions</h3>
            </div>
            <div className="divide-y divide-[#1e321e]">
              {regions.map(r => (
                <div key={r._id} className="flex items-center gap-3 px-4 py-2">
                  <span className="text-[10px] font-mono text-[#5a705a] w-16 flex-shrink-0">{r.code}</span>
                  <span className="text-xs text-[#e8f0e8] w-44 flex-shrink-0 truncate">{r.nom}</span>
                  <div className="flex flex-wrap gap-1">
                    {r.provinces.map(p => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-[#0a110a] border border-[#1e321e] text-[#8fa88f]">{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zone detail modal */}
      {selectedZone && (
        <Modal
          isOpen
          onClose={() => setSelectedZone(null)}
          title={selectedZone.nom}
          subtitle={`Zone n°${selectedZone.numero} · ${selectedZone.code}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelectedZone(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Code', selectedZone.code],
                ['Numéro', String(selectedZone.numero)],
                ['Quartier général', selectedZone.quartierGeneral],
                ['Statut opérationnel', selectedZone.statutOperationnel],
                ['Niveau d\'alerte', alerteConfig[selectedZone.niveauAlerte]?.label ?? selectedZone.niveauAlerte],
                ['Régions', String(selectedZone.nombreRegions)],
                ['Provinces', String(selectedZone.nombreProvinces)],
                ['Bases', String(selectedZone.nombreBases)],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            {selectedZone.nombreMilitaires > 0 && (
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Effectif total estimé</div>
                <div className="text-lg font-bold text-blue-400">{selectedZone.nombreMilitaires.toLocaleString('fr-FR')}</div>
                <div className="text-[10px] text-[#5a705a]">militaires sous commandement</div>
              </div>
            )}
            {selectedZone.localisation?.coordonnees && (
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Coordonnées QG</div>
                <div className="text-xs font-mono text-green-400">
                  {selectedZone.localisation.coordonnees.lat.toFixed(4)}°, {selectedZone.localisation.coordonnees.lng.toFixed(4)}°
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Region detail modal */}
      {selectedRegion && (
        <Modal
          isOpen
          onClose={() => setSelectedRegion(null)}
          title={selectedRegion.nom}
          subtitle={`Région n°${selectedRegion.numero} · ${selectedRegion.code} · ${zoneNom(selectedRegion.zone)}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelectedRegion(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Code', selectedRegion.code],
                ['Zone', zoneNom(selectedRegion.zone)],
                ['Quartier général', selectedRegion.quartierGeneral ?? '—'],
                ['Statut', selectedRegion.statut],
                ['Niveau d\'alerte', alerteConfig[selectedRegion.niveauAlerte]?.label ?? selectedRegion.niveauAlerte],
                ['Nombre de provinces', String(selectedRegion.provinces.length)],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Provinces couvertes</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedRegion.provinces.map(p => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">{p}</span>
                ))}
              </div>
            </div>
            {selectedRegion.statistiques && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Militaires', selectedRegion.statistiques.militaires ?? 0],
                  ['Unités', selectedRegion.statistiques.unites ?? 0],
                  ['Bases', selectedRegion.statistiques.bases ?? 0],
                ].map(([l, v]) => (
                  <div key={String(l)} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e] text-center">
                    <div className="text-sm font-bold text-green-400">{Number(v).toLocaleString('fr-FR')}</div>
                    <div className="text-[9px] text-[#5a705a]">{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
