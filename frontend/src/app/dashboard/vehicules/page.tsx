'use client'

import { useState, useEffect } from 'react'
import { Truck, MapPin, Fuel, Wrench, Eye, AlertTriangle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import vehiculesService, { type Vehicule } from '@/services/vehicules.service'

const typeLabels: Record<string, string> = {
  blinde: 'Blindé',
  camion: 'Camion',
  vehicule_leger: 'Véhicule léger',
  moto: 'Moto',
  commandement: 'Commandement',
  bateau: 'Bateau',
  drone: 'Drone',
}

const statutLabel = (s: string) => {
  switch (s) {
    case 'operationnel': return 'Opérationnel'
    case 'en_mission': return 'En mission'
    case 'maintenance': return 'Maintenance'
    case 'hs': return 'H.S.'
    default: return s
  }
}

function uniteNom(u: Vehicule['unite']): string {
  if (!u) return '—'
  if (typeof u === 'object') return u.nom
  return String(u)
}

function chauffeurNom(c: Vehicule['chauffeurAssigne']): string {
  if (!c) return '—'
  if (typeof c === 'object') return `${c.nom} ${c.prenom}`
  return String(c)
}

export default function VehiculesPage() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Vehicule | null>(null)

  useEffect(() => {
    vehiculesService.getAll({ limit: 200 })
      .then(res => setVehicules((res.data as Vehicule[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ vehicules: mock }) => setVehicules(mock as unknown as Vehicule[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const operationnels = vehicules.filter(v => v.statut === 'operationnel').length
  const enMission = vehicules.filter(v => v.statut === 'en_mission').length
  const maintenance = vehicules.filter(v => v.statut === 'maintenance').length
  const horsService = vehicules.filter(v => v.statut === 'hs').length

  const columns: { key: string; header: string; sortable?: boolean; render: (v: Vehicule) => React.ReactNode }[] = [
    {
      key: 'immatriculation',
      header: 'Immatriculation',
      sortable: true,
      render: v => <span className="font-mono text-[11px] text-green-400">{v.immatriculation}</span>,
    },
    {
      key: 'designation',
      header: 'Véhicule',
      render: v => (
        <div>
          <div className="text-xs font-medium text-[#e8f0e8]">{v.marque ?? ''} {v.modele ?? ''} {v.designation}</div>
          <div className="text-[10px] text-[#5a705a]">{typeLabels[v.type] ?? v.type}{v.annee ? ` · ${v.annee}` : ''}</div>
        </div>
      ),
    },
    {
      key: 'unite',
      header: 'Unité',
      render: v => <span className="font-mono text-xs text-[#8fa88f]">{uniteNom(v.unite)}</span>,
    },
    {
      key: 'chauffeurAssigne',
      header: 'Chauffeur',
      render: v => <span className="text-xs text-[#8fa88f]">{chauffeurNom(v.chauffeurAssigne)}</span>,
    },
    {
      key: 'kilometrage',
      header: 'Kilométrage',
      sortable: true,
      render: v => <span className="text-xs text-[#8fa88f]">{v.kilometrage?.toLocaleString('fr-FR') ?? '—'} km</span>,
    },
    {
      key: 'niveauCarburant',
      header: 'Carburant',
      render: v => {
        const pct = v.niveauCarburant ?? 0
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-[#1e321e] rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-[#5a705a]">{pct}%</span>
          </div>
        )
      },
    },
    {
      key: 'statut',
      header: 'Statut',
      render: v => (
        <Badge
          label={statutLabel(v.statut)}
          variant={v.statut === 'operationnel' ? 'actif' : v.statut === 'en_mission' ? 'mission' : v.statut === 'hs' ? 'blesse' : 'en_attente'}
          dot
        />
      ),
    },
    {
      key: 'positionGPS',
      header: 'GPS',
      render: v => v.positionGPS ? (
        <div className="flex items-center gap-1 text-[10px] text-green-400">
          <MapPin size={10} />
          Actif
        </div>
      ) : <span className="text-[10px] text-[#5a705a]">—</span>,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <Header title="Gestion de la flotte" subtitle="Véhicules militaires FARDC · Suivi GPS et maintenance" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Opérationnels" value={isLoading ? '…' : operationnels} icon={<Truck size={16} />} color="green" size="sm" />
          <StatCard title="En mission" value={isLoading ? '…' : enMission} icon={<MapPin size={16} />} color="blue" size="sm" />
          <StatCard title="En maintenance" value={isLoading ? '…' : maintenance} icon={<Wrench size={16} />} color="yellow" size="sm" />
          <StatCard title="Hors service" value={isLoading ? '…' : horsService} icon={<AlertTriangle size={16} />} color="red" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center gap-2">
            <Truck size={15} className="text-green-400" />
            <span className="text-sm font-semibold text-[#e8f0e8]">Registre de la flotte</span>
            {isLoading
              ? <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              : <span className="text-xs text-[#5a705a] ml-1">({vehicules.length} véhicules)</span>
            }
          </div>
          <div className="p-4">
            <DataTable
              data={vehicules}
              columns={columns}
              searchPlaceholder="Rechercher par immatriculation, désignation..."
              pageSize={8}
              actions={(v: Vehicule) => (
                <button type="button" title="Voir le dossier" onClick={() => setSelected(v)} className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all">
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
          title={`${selected.marque ?? ''} ${selected.modele ?? selected.designation}`}
          subtitle={selected.immatriculation}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Type', typeLabels[selected.type] ?? selected.type],
                ['Année', selected.annee?.toString() ?? '—'],
                ['Unité', uniteNom(selected.unite)],
                ['Kilométrage', `${selected.kilometrage?.toLocaleString('fr-FR') ?? '—'} km`],
                ['Prochaine maintenance', selected.prochaineMaintenance ? new Date(selected.prochaineMaintenance).toLocaleDateString('fr-FR') : '—'],
                ['Valeur USD', selected.valeurUSD ? `${selected.valeurUSD.toLocaleString()} USD` : '—'],
                ['Chauffeur', chauffeurNom(selected.chauffeurAssigne)],
                ['Statut', statutLabel(selected.statut)],
              ].map(([l, v]) => (
                <div key={String(l)} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-sm font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            {selected.niveauCarburant != null && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Fuel size={10} />
                  Niveau de carburant
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#1e321e] rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${selected.niveauCarburant > 50 ? 'bg-green-500' : selected.niveauCarburant > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${selected.niveauCarburant}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[#e8f0e8]">{selected.niveauCarburant}%</span>
                </div>
              </div>
            )}
            {selected.positionGPS && (
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/30">
                <div className="text-[10px] text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={10} />
                  Position GPS actuelle
                </div>
                <div className="text-xs font-mono text-green-400">
                  {selected.positionGPS.lat.toFixed(6)}°N, {selected.positionGPS.lng.toFixed(6)}°E
                </div>
                {selected.positionGPS.derniereMAJ && (
                  <div className="text-[10px] text-[#5a705a] mt-1">
                    Mise à jour : {new Date(selected.positionGPS.derniereMAJ).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
