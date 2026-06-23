'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, MapPin, Shield, Plane, Ship, Settings, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import unitesService, { type Unite } from '@/services/unites.service'
import { clsx } from 'clsx'

const typeLabels: Record<string, string> = {
  emg: 'État-Major Général', commandement: 'Commandement', direction: 'Direction', force: 'Grande Force',
  zone: 'Zone de Défense', region: 'Région Militaire', division: 'Division', brigade: 'Brigade',
  regiment: 'Régiment', bataillon: 'Bataillon', compagnie: 'Compagnie', peloton: 'Peloton',
  section: 'Section', escouade: 'Escouade', base: 'Base Militaire',
  region_aerienne: 'Région Aérienne', base_aerienne: 'Base Aérienne',
  escadre: 'Escadre', groupe_aerien: 'Groupe Aérien', escadron: 'Escadron',
  flottille: 'Flottille', detachement: 'Détachement',
  region_navale: 'Région Navale', base_navale: 'Base Navale',
  flotte: 'Flotte', escadre_navale: 'Escadre Navale', escadron_naval: 'Escadron Naval',
}

type ForceKey = 'all' | 'terrestre' | 'aerienne' | 'maritime' | 'emg'

const FORCES: { key: ForceKey; label: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  { key: 'all',       label: 'Toutes',         icon: Building2, color: 'text-[#e8f0e8]',  bg: 'bg-[#1e321e]',     border: 'border-[#2a3e2a]' },
  { key: 'emg',       label: 'EMG',            icon: Settings,  color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { key: 'terrestre', label: 'Force Terrestre', icon: Shield,    color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30' },
  { key: 'aerienne',  label: 'Force Aérienne',  icon: Plane,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  { key: 'maritime',  label: 'Force Maritime',  icon: Ship,     color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30' },
]

const forceColor: Record<string, string> = {
  emg: 'text-yellow-400', terrestre: 'text-green-400', aerienne: 'text-blue-400', maritime: 'text-cyan-400',
}
const forceBg: Record<string, string> = {
  emg: 'bg-yellow-500/10', terrestre: 'bg-green-500/10', aerienne: 'bg-blue-500/10', maritime: 'bg-cyan-500/10',
}
const forceBorder: Record<string, string> = {
  emg: 'border-yellow-500/20', terrestre: 'border-green-500/20', aerienne: 'border-blue-500/20', maritime: 'border-cyan-500/20',
}

const TERRESTRE_LEVELS = ['force','zone','region','division','brigade','regiment','bataillon','compagnie','peloton','section','escouade','base']
const AERIENNE_LEVELS  = ['force','region_aerienne','base_aerienne','escadre','groupe_aerien','escadron','flottille','detachement']
const MARITIME_LEVELS  = ['force','region_navale','base_navale','flotte','escadre_navale','escadron_naval','detachement']
const EMG_LEVELS       = ['emg','commandement','direction']
const INDENT_CLS = ['ml-0','ml-3','ml-6','ml-9','ml-12','ml-16','ml-20']

const statutColor: Record<string, string> = {
  operationnelle: 'text-green-400 bg-green-500/10',
  en_operations:  'text-blue-400 bg-blue-500/10',
  en_formation:   'text-purple-400 bg-purple-500/10',
  au_repos:       'text-gray-400 bg-gray-500/10',
}
const statutLabel: Record<string, string> = {
  operationnelle: '✓ Opérationnelle', en_operations: '⚡ En opérations',
  en_formation: '📚 En formation', au_repos: '⏸ Au repos',
}

function levelDepth(u: Unite): number {
  const list = u.force === 'terrestre' ? TERRESTRE_LEVELS
    : u.force === 'aerienne' ? AERIENNE_LEVELS
    : u.force === 'maritime' ? MARITIME_LEVELS
    : EMG_LEVELS
  const i = list.indexOf(u.type)
  return i < 0 ? 0 : i
}

function locLabel(u: Unite): string {
  if (!u.localisation) return '—'
  return u.localisation.adresse ?? u.localisation.territoire ?? u.localisation.province ?? '—'
}

function cmdLabel(c: Unite['commandant']): string {
  if (!c) return '—'
  if (typeof c === 'object') return `${c.nom} ${c.prenom}`
  return String(c)
}

function pct(u: Unite): number {
  const actuel = u.effectifActuel ?? 0
  const max = u.effectifAutorise ?? 1
  return Math.round((actuel / max) * 100)
}

export default function UnitesPage() {
  const [unites, setUnites] = useState<Unite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Unite | null>(null)
  const [forceFilter, setForceFilter] = useState<ForceKey>('all')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    unitesService.getAll({ limit: 200 })
      .then(res => setUnites((res.data as Unite[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ unites: mock }) => setUnites(mock as unknown as Unite[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const ftCount  = unites.filter(u => u.force === 'terrestre').length
  const faCount  = unites.filter(u => u.force === 'aerienne').length
  const fmCount  = unites.filter(u => u.force === 'maritime').length
  const emgCount = unites.filter(u => u.force === 'emg').length
  const totalEff = unites.reduce((s, u) => s + (u.effectifActuel ?? 0), 0)

  const filtered = unites.filter(u => {
    if (forceFilter !== 'all' && u.force !== forceFilter) return false
    if (typeFilter && u.type !== typeFilter) return false
    return true
  })

  const grouped = FORCES.filter(f => f.key !== 'all').map(f => ({
    ...f,
    units: filtered.filter(u => u.force === f.key),
  })).filter(g => g.units.length > 0)

  const displayList = forceFilter === 'all' ? null : filtered

  return (
    <div className="flex flex-col h-full">
      <Header title="Structure organisationnelle FARDC" subtitle="Forces Armées de la RDC · EMG + 3 Grandes Forces" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard title="Total effectif" value={isLoading ? '…' : totalEff.toLocaleString('fr-FR')} icon={<Users size={16} />} color="green" size="sm" />
          <StatCard title="EMG & Directions" value={isLoading ? '…' : emgCount} icon={<Settings size={16} />} color="yellow" size="sm" />
          <StatCard title="Force Terrestre" value={isLoading ? '…' : `${ftCount} unités`} icon={<Shield size={16} />} color="green" size="sm" />
          <StatCard title="Force Aérienne" value={isLoading ? '…' : `${faCount} unités`} icon={<Plane size={16} />} color="blue" size="sm" />
          <StatCard title="Force Maritime" value={isLoading ? '…' : `${fmCount} unités`} icon={<Ship size={16} />} color="gray" size="sm" />
        </div>

        {/* Force tabs */}
        <div className="flex flex-wrap gap-2">
          {FORCES.map(f => {
            const Icon = f.icon
            return (
              <button
                type="button"
                key={f.key}
                onClick={() => { setForceFilter(f.key); setTypeFilter('') }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all',
                  forceFilter === f.key
                    ? `${f.color} ${f.bg} ${f.border}`
                    : 'text-[#5a705a] border-[#1e321e] hover:text-[#e8f0e8] hover:border-[#2a3e2a]'
                )}
              >
                <Icon size={13} />
                {f.label}
              </button>
            )
          })}
          {forceFilter !== 'all' && (
            <select
              aria-label="Filtrer par niveau hiérarchique"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="ml-auto bg-[#0f1a0f] border border-[#1e321e] rounded-xl px-3 py-2 text-xs text-[#e8f0e8] focus:outline-none focus:border-green-500/50"
            >
              <option value="">Tous les niveaux</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          </div>
        )}

        {/* All forces overview */}
        {!isLoading && forceFilter === 'all' && (
          <div className="space-y-5">
            {grouped.map(g => {
              const Icon = g.icon
              return (
                <div key={g.key} className={clsx('bg-[#141e14] border rounded-xl overflow-hidden', g.border)}>
                  <div className={clsx('px-4 py-3 border-b flex items-center gap-3', g.border)}>
                    <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center', g.bg)}>
                      <Icon size={15} className={g.color} />
                    </div>
                    <div>
                      <div className={clsx('text-sm font-bold', g.color)}>{g.label}</div>
                      <div className="text-[10px] text-[#5a705a]">
                        {g.units.length} unités · {g.units.reduce((s, u) => s + (u.effectifActuel ?? 0), 0).toLocaleString('fr-FR')} hommes
                      </div>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {g.units.map(u => (
                      <UnitCard key={u._id} u={u} onSelect={setSelected} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Single force list */}
        {!isLoading && forceFilter !== 'all' && displayList && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 flex-wrap pb-2">
              {(forceFilter === 'terrestre' ? TERRESTRE_LEVELS
                : forceFilter === 'aerienne' ? AERIENNE_LEVELS
                : forceFilter === 'maritime' ? MARITIME_LEVELS
                : EMG_LEVELS
              ).map((lvl, i, arr) => (
                <span key={lvl} className="flex items-center gap-1">
                  <span
                    className={clsx('text-[10px] px-2 py-0.5 rounded-full border cursor-pointer transition-all',
                      typeFilter === lvl
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8]'
                    )}
                    onClick={() => setTypeFilter(typeFilter === lvl ? '' : lvl)}
                  >
                    {typeLabels[lvl]}
                  </span>
                  {i < arr.length - 1 && <ChevronRight size={8} className="text-[#2a3e2a]" />}
                </span>
              ))}
            </div>

            {[...displayList].sort((a, b) => levelDepth(a) - levelDepth(b)).map(u => {
              const depth = Math.min(levelDepth(u), INDENT_CLS.length - 1)
              return (
                <button
                  type="button"
                  key={u._id}
                  onClick={() => setSelected(u)}
                  className={clsx(
                    'flex items-start gap-3 p-3 bg-[#0f1a0f] border border-[#1e321e] rounded-xl hover:border-green-500/30 transition-all text-left',
                    INDENT_CLS[depth],
                    depth === 0 ? 'w-full' : 'w-[calc(100%-0.75rem)]',
                  )}
                >
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono', forceBg[u.force ?? 'emg'], forceColor[u.force ?? 'emg'])}>
                    {u.code.slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-[#e8f0e8] truncate">{u.nom}</span>
                      {u.statut && (
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0', statutColor[u.statut] ?? 'text-[#5a705a]')}>
                          {statutLabel[u.statut] ?? u.statut}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#5a705a]">
                      <span className={forceColor[u.force ?? 'emg']}>{typeLabels[u.type]}</span>
                      {locLabel(u) !== '—' && <><span>·</span><MapPin size={9} />{locLabel(u)}</>}
                      {u.commandant && <><span>·</span><span className="truncate">{cmdLabel(u.commandant)}</span></>}
                    </div>
                    {u.effectifAutorise && u.effectifActuel != null && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 bg-[#1e321e] rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-green-500/60 transition-all"
                            style={{ width: `${pct(u)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#5a705a]">
                          {(u.effectifActuel ?? 0).toLocaleString('fr-FR')}/{(u.effectifAutorise ?? 0).toLocaleString('fr-FR')} ({pct(u)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.nom}
          subtitle={`${typeLabels[selected.type] ?? selected.type} · ${selected.code}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Code', selected.code],
                ['Force', selected.force?.toUpperCase() ?? 'EMG'],
                ['Niveau', typeLabels[selected.type] ?? selected.type],
                ['Province', selected.localisation?.province ?? '—'],
                ['Localisation', locLabel(selected)],
                ['Commandant', cmdLabel(selected.commandant)],
                ['Statut', statutLabel[selected.statut ?? ''] ?? (selected.statut ?? '—')],
                ['Effectif actuel', (selected.effectifActuel ?? 0).toLocaleString('fr-FR')],
                ['Effectif autorisé', (selected.effectifAutorise ?? 0).toLocaleString('fr-FR')],
                ['Taux remplissage', `${pct(selected)}%`],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            {selected.localisation?.coordonnees && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">Coordonnées GPS</div>
                <div className="text-xs font-mono text-green-400">
                  {selected.localisation.coordonnees.lat.toFixed(4)}°, {selected.localisation.coordonnees.lng.toFixed(4)}°
                </div>
              </div>
            )}
            {selected.contact && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Contact</div>
                <div className="space-y-1 text-xs text-[#8fa88f]">
                  {selected.contact.telephone && <div>Tél : {selected.contact.telephone}</div>}
                  {selected.contact.radio && <div>Radio : {selected.contact.radio}</div>}
                  {selected.contact.email && <div>Email : {selected.contact.email}</div>}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

function UnitCard({ u, onSelect }: { u: Unite; onSelect: (u: Unite) => void }) {
  const p = pct(u)
  return (
    <button
      type="button"
      onClick={() => onSelect(u)}
      className={clsx(
        'flex items-start gap-2.5 p-3 rounded-xl border transition-all text-left hover:border-green-500/30 w-full bg-[#0a110a]',
        forceBorder[u.force ?? 'emg']
      )}
    >
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold', forceBg[u.force ?? 'emg'], forceColor[u.force ?? 'emg'])}>
        {u.code.slice(0, 3)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-[#e8f0e8] truncate">{u.nom}</div>
        <div className="text-[10px] text-[#5a705a] mb-1">{typeLabels[u.type]} · {locLabel(u)}</div>
        {u.effectifAutorise && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#1e321e] rounded-full h-1">
              <div
                className={clsx('h-1 rounded-full', p > 80 ? 'bg-green-500' : p > 50 ? 'bg-yellow-500' : 'bg-red-500')}
                style={{ width: `${p}%` }}
              />
            </div>
            <span className="text-[10px] text-[#5a705a]">{p}%</span>
          </div>
        )}
      </div>
    </button>
  )
}
