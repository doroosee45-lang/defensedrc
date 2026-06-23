'use client'

import { useState, useEffect } from 'react'
import { MapPin, Truck, Users, Activity, Navigation, AlertTriangle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import geolocalisationService, { type PositionPersonnel, type PositionVehicule } from '@/services/geolocalisation.service'
import { clsx } from 'clsx'

type LayerType = 'all' | 'personnel' | 'vehicules'

function toMapPct(lat: number, lng: number) {
  const x = Math.min(95, Math.max(5, 30 + ((lng - 15) / 20) * 60))
  const y = Math.min(95, Math.max(5, 10 + ((-lat + 5) / 20) * 80))
  return { x, y }
}

export default function GeolocalisationPage() {
  const [personnel, setPersonnel] = useState<PositionPersonnel[]>([])
  const [vehicules, setVehicules] = useState<PositionVehicule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerType>('all')
  const [selected, setSelected] = useState<(PositionPersonnel | PositionVehicule) & { _type: string } | null>(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    geolocalisationService.getAllPositions()
      .then(res => {
        const data = res.data as { personnel: PositionPersonnel[]; vehicules: PositionVehicule[] }
        setPersonnel(data.personnel ?? [])
        setVehicules(data.vehicules ?? [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const enMission = vehicules.filter(v => v.statut === 'en_mission').length

  return (
    <div className="flex flex-col h-full">
      <Header title="Géolocalisation GPS & Cartographie" subtitle="Suivi temps réel · FARDC" />

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row mt-2">

        {/* ── LEFT PANEL ── */}
        <div className="lg:w-72 border-r border-[#1e321e] flex flex-col bg-[#0a110a] overflow-hidden">

          {/* Stats */}
          <div className="p-4 border-b border-[#1e321e] space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#e8f0e8]">Tracking en temps réel</span>
              <span className="text-[10px] text-[#5a705a] ml-auto font-mono">{time.toLocaleTimeString('fr-FR')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Personnel', value: personnel.length, color: 'text-blue-400', icon: <Users size={11} /> },
                { label: 'Véhicules', value: vehicules.length, color: 'text-green-400', icon: <Truck size={11} /> },
                { label: 'En mission', value: enMission, color: 'text-orange-400', icon: <Activity size={11} /> },
              ].map(s => (
                <div key={s.label} className="bg-[#141e14] border border-[#1e321e] rounded-xl p-2 text-center">
                  <div className={`flex justify-center mb-0.5 ${s.color}`}>{s.icon}</div>
                  <div className={`text-base font-bold ${s.color}`}>{isLoading ? '…' : s.value}</div>
                  <div className="text-[9px] text-[#5a705a]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Layer filter */}
          <div className="p-3 border-b border-[#1e321e]">
            <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Couches</div>
            <div className="flex gap-1.5">
              {([
                { key: 'all', label: 'Tout' },
                { key: 'personnel', label: 'Personnel' },
                { key: 'vehicules', label: 'Véhicules' },
              ] as { key: LayerType; label: string }[]).map(l => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setActiveLayer(l.key)}
                  className={clsx(
                    'px-2 py-1 rounded-lg text-[11px] font-medium transition-all',
                    activeLayer === l.key
                      ? 'bg-green-600 text-white'
                      : 'bg-[#141e14] text-[#5a705a] border border-[#1e321e] hover:text-[#e8f0e8]'
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">

            {(activeLayer === 'all' || activeLayer === 'vehicules') && vehicules.map(v => (
              <button
                key={v._id}
                type="button"
                onClick={() => setSelected({ ...v, _type: 'vehicule' })}
                className={clsx(
                  'w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                  selected && '_id' in selected && selected._id === v._id
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-[#1e321e] bg-[#141e14] hover:border-green-500/30'
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-green-800/30 flex items-center justify-center flex-shrink-0">
                  <Truck size={13} className="text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono text-[#e8f0e8] truncate">{v.immatriculation}</div>
                  <div className="text-[10px] text-[#5a705a] truncate">{v.designation}</div>
                  <div className="text-[9px] font-mono text-green-400">
                    {v.positionGPS.lat.toFixed(4)}°, {v.positionGPS.lng.toFixed(4)}°
                  </div>
                </div>
                <Badge label={v.statut} variant={v.statut === 'en_mission' ? 'mission' : v.statut === 'operationnel' ? 'actif' : 'en_attente'} size="xs" />
              </button>
            ))}

            {(activeLayer === 'all' || activeLayer === 'personnel') && personnel.map(p => (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelected({ ...p, _type: 'personnel' })}
                className={clsx(
                  'w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                  selected && '_id' in selected && selected._id === p._id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-[#1e321e] bg-[#141e14] hover:border-blue-500/30'
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-800/30 flex items-center justify-center flex-shrink-0">
                  <Users size={13} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#e8f0e8] truncate">{p.nom} {p.prenom}</div>
                  <div className="text-[10px] text-[#5a705a] truncate">{p.gradeNom ?? ''} · {p.uniteNom ?? ''}</div>
                  <div className="text-[9px] font-mono text-blue-400">
                    {p.positionGPS.lat.toFixed(4)}°, {p.positionGPS.lng.toFixed(4)}°
                  </div>
                </div>
                <Badge label={p.statut} variant={p.statut === 'actif' ? 'actif' : 'en_attente'} size="xs" />
              </button>
            ))}

            {!isLoading && vehicules.length === 0 && personnel.length === 0 && (
              <div className="text-center py-8 text-xs text-[#5a705a]">Aucune position GPS disponible</div>
            )}
          </div>
        </div>

        {/* ── MAP AREA ── */}
        <div className="flex-1 relative bg-[#060e06] overflow-hidden">
          <div className="absolute inset-0">
            {/* Fake map background grid */}
            <svg width="100%" height="100%" className="opacity-20">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e321e" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Map label */}
            <div className="absolute top-3 left-3 bg-[#0a110a]/90 border border-[#1e321e] rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Navigation size={12} className="text-green-400" />
              <span className="text-[10px] font-mono text-[#8fa88f]">RD CONGO — Zone opérationnelle FARDC</span>
            </div>

            {/* Vehicle dots */}
            {(activeLayer === 'all' || activeLayer === 'vehicules') && vehicules.map(v => {
              const { x, y } = toMapPct(v.positionGPS.lat, v.positionGPS.lng)
              const isSelected = selected?._type === 'vehicule' && '_id' in selected && selected._id === v._id
              return (
                <button
                  key={v._id}
                  type="button"
                  title={`${v.immatriculation} — ${v.designation}`}
                  onClick={() => setSelected({ ...v, _type: 'vehicule' })}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={clsx(
                    'absolute -translate-x-1/2 -translate-y-1/2 transition-all',
                    isSelected ? 'z-20' : 'z-10 hover:z-20'
                  )}
                >
                  <div className={clsx(
                    'w-3 h-3 rounded-full border-2',
                    v.statut === 'en_mission' ? 'bg-orange-400 border-orange-600 animate-pulse' : 'bg-green-400 border-green-600',
                    isSelected && 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-125'
                  )} />
                </button>
              )
            })}

            {/* Personnel dots */}
            {(activeLayer === 'all' || activeLayer === 'personnel') && personnel.map(p => {
              const { x, y } = toMapPct(p.positionGPS.lat, p.positionGPS.lng)
              const isSelected = selected?._type === 'personnel' && '_id' in selected && selected._id === p._id
              return (
                <button
                  key={p._id}
                  type="button"
                  title={`${p.nom} ${p.prenom} — ${p.gradeNom ?? ''}`}
                  onClick={() => setSelected({ ...p, _type: 'personnel' })}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={clsx(
                    'absolute -translate-x-1/2 -translate-y-1/2 transition-all',
                    isSelected ? 'z-20' : 'z-10 hover:z-20'
                  )}
                >
                  <div className={clsx(
                    'w-2.5 h-2.5 rounded-sm border-2 bg-blue-400 border-blue-600',
                    isSelected && 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-125'
                  )} />
                </button>
              )
            })}

            {/* Selected info panel */}
            {selected && (
              <div className="absolute bottom-4 right-4 w-64 bg-[#0a110a]/95 border border-[#1e321e] rounded-xl p-3 backdrop-blur-sm z-30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {selected._type === 'vehicule' ? <Truck size={12} className="text-green-400" /> : <Users size={12} className="text-blue-400" />}
                    <span className="text-xs font-semibold text-[#e8f0e8]">
                      {selected._type === 'vehicule'
                        ? (selected as PositionVehicule).immatriculation
                        : `${(selected as PositionPersonnel).nom} ${(selected as PositionPersonnel).prenom}`}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="text-[#5a705a] hover:text-[#e8f0e8] text-xs">✕</button>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  {selected._type === 'vehicule' ? (
                    <>
                      <div className="flex justify-between"><span className="text-[#5a705a]">Type</span><span className="text-[#e8f0e8]">{(selected as PositionVehicule).type}</span></div>
                      <div className="flex justify-between"><span className="text-[#5a705a]">Statut</span><span className="text-[#e8f0e8]">{(selected as PositionVehicule).statut}</span></div>
                      {(selected as PositionVehicule).positionGPS.vitesse != null && (
                        <div className="flex justify-between"><span className="text-[#5a705a]">Vitesse</span><span className="text-green-400">{(selected as PositionVehicule).positionGPS.vitesse} km/h</span></div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between"><span className="text-[#5a705a]">Matricule</span><span className="text-[#e8f0e8] font-mono">{(selected as PositionPersonnel).matricule}</span></div>
                      <div className="flex justify-between"><span className="text-[#5a705a]">Grade</span><span className="text-[#e8f0e8]">{(selected as PositionPersonnel).gradeNom ?? '—'}</span></div>
                      <div className="flex justify-between"><span className="text-[#5a705a]">Unité</span><span className="text-[#e8f0e8]">{(selected as PositionPersonnel).uniteNom ?? '—'}</span></div>
                    </>
                  )}
                  <div className="flex justify-between pt-1 border-t border-[#1e321e]">
                    <span className="text-[#5a705a]">GPS</span>
                    <span className="font-mono text-green-400">
                      {selected.positionGPS.lat.toFixed(4)}°, {selected.positionGPS.lng.toFixed(4)}°
                    </span>
                  </div>
                  {selected.positionGPS.derniereMAJ && (
                    <div className="flex justify-between">
                      <span className="text-[#5a705a]">MAJ</span>
                      <span className="text-[#5a705a]">{new Date(selected.positionGPS.derniereMAJ).toLocaleTimeString('fr-FR')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-[#0a110a]/90 border border-[#1e321e] rounded-lg px-3 py-2 space-y-1.5">
              <div className="text-[9px] text-[#5a705a] uppercase tracking-wider mb-1">Légende</div>
              {[
                { color: 'bg-green-400', label: 'Véhicule opérationnel' },
                { color: 'bg-orange-400 animate-pulse', label: 'Véhicule en mission' },
                { color: 'bg-blue-400 rounded-sm', label: 'Personnel' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-[9px] text-[#8fa88f]">{l.label}</span>
                </div>
              ))}
            </div>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-[#8fa88f]">
                  <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                  Chargement des positions GPS...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
