'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Search, Shield, Wifi, Clock, ChevronDown, User, Settings, LogOut, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/context/AuthContext'
import alertesService, { type Alerte } from '@/services/alertes.service'

const ROLE_LABELS: Record<string, string> = {
  souverain: 'Souverain',
  super_admin: 'Super Administrateur',
  admin_national: 'Admin National',
  admin_provincial: 'Admin Provincial',
  admin_territorial: 'Admin Territorial',
  admin_sectoriel: 'Admin Sectoriel',
  officier_commandant: 'Officier Commandant',
  utilisateur_operationnel: 'Utilisateur Opérationnel',
}

const niveauColor = (niveau: string) => {
  switch (niveau) {
    case 'critique': return 'border-l-red-500 bg-red-500/5'
    case 'haute': return 'border-l-orange-500 bg-orange-500/5'
    case 'moyenne': return 'border-l-yellow-500 bg-yellow-500/5'
    default: return 'border-l-blue-500 bg-blue-500/5'
  }
}

const niveauDot = (niveau: string) => {
  switch (niveau) {
    case 'critique': return 'bg-red-500'
    case 'haute': return 'bg-orange-500'
    case 'moyenne': return 'bg-yellow-500'
    default: return 'bg-blue-500'
  }
}

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [showAlerts, setShowAlerts] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [alertesLoading, setAlertesLoading] = useState(false)

  // Clock
  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  // Fetch active alerts on mount
  useEffect(() => {
    let cancelled = false
    setAlertesLoading(true)
    alertesService.getActives()
      .then(res => { if (!cancelled) setAlertes((res.data as Alerte[]) ?? []) })
      .catch(() => {
        if (cancelled) return
        // Fallback to mock alertes
        import('@/data/mockData')
          .then(({ alertes: mock }) => { if (!cancelled) setAlertes(mock as unknown as Alerte[]) })
          .catch(() => {})
      })
      .finally(() => { if (!cancelled) setAlertesLoading(false) })
    return () => { cancelled = true }
  }, [])

  const unread = alertes.filter(a => a.statut === 'active')

  const initials = user
    ? `${(user.prenom?.[0] ?? '').toUpperCase()}${(user.nom?.[0] ?? '').toUpperCase()}`
    : '?'

  const handleLogout = async () => {
    setShowProfile(false)
    await logout()
    router.replace('/')
  }

  return (
    <header className="sticky top-0 z-20 bg-[#0a110a]/95 backdrop-blur-sm border-b border-[#1e321e] px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="min-w-0 flex-1 pl-10 lg:pl-0">
          <h1 className="text-base font-bold text-[#e8f0e8] leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-[#5a705a] truncate">{subtitle}</p>}
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a705a]" />
            <input
              type="text"
              placeholder="Recherche globale..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full bg-[#0f1a0f] border border-[#1e321e] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#e8f0e8] placeholder-[#5a705a] focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* System status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
            <Wifi size={11} className="text-green-400" />
            <span className="text-[10px] text-[#5a705a]">Sécurisé</span>
          </div>

          {/* Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
            <Clock size={11} className="text-[#5a705a]" />
            <span className="text-[10px] text-[#8fa88f] font-mono">{timeStr}</span>
          </div>

          {/* Alerts */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowAlerts(!showAlerts); setShowProfile(false) }}
              className="relative p-2 rounded-lg text-[#8fa88f] hover:text-[#e8f0e8] hover:bg-[#1a261a] transition-all"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {unread.length > 9 ? '9+' : unread.length}
                </span>
              )}
            </button>

            {showAlerts && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0f1a0f] border border-[#1e321e] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#e8f0e8]">Alertes</span>
                  <span className="text-[10px] text-[#5a705a]">
                    {alertesLoading ? 'Chargement…' : `${unread.length} non lues`}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alertesLoading && (
                    <div className="py-8 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                    </div>
                  )}
                  {!alertesLoading && alertes.length === 0 && (
                    <div className="py-8 text-center">
                      <AlertCircle size={20} className="text-[#5a705a] mx-auto mb-2" />
                      <p className="text-xs text-[#5a705a]">Aucune alerte active</p>
                    </div>
                  )}
                  {!alertesLoading && alertes.slice(0, 5).map(alerte => (
                    <div
                      key={alerte._id}
                      className={clsx('px-4 py-3 border-b border-[#1e321e]/50 border-l-2 cursor-pointer hover:bg-[#141e14] transition-colors', niveauColor(alerte.niveau))}
                    >
                      <div className="flex items-start gap-2">
                        <div className={clsx('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', niveauDot(alerte.niveau))} />
                        <div>
                          <div className="text-xs font-medium text-[#e8f0e8]">{alerte.titre}</div>
                          <div className="text-[10px] text-[#5a705a] mt-0.5 line-clamp-2">{alerte.description}</div>
                          <div className="text-[9px] text-[#5a705a] mt-1">
                            {alerte.createdAt ? new Date(alerte.createdAt).toLocaleString('fr-FR') : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[#1e321e]">
                  <a
                    href="/dashboard/alertes"
                    className="text-xs text-green-400 hover:text-green-300 transition-colors"
                    onClick={() => setShowAlerts(false)}
                  >
                    Voir toutes les alertes →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setShowProfile(!showProfile); setShowAlerts(false) }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1a261a] transition-all"
              aria-label="Menu utilisateur"
            >
              <div className="w-7 h-7 rounded-full bg-green-800 flex items-center justify-center text-white text-[11px] font-bold border border-green-600/40">
                {initials || <User size={12} />}
              </div>
              <ChevronDown size={12} className="text-[#5a705a] hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f1a0f] border border-[#1e321e] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1e321e]">
                  {user ? (
                    <>
                      <div className="text-xs font-semibold text-[#e8f0e8]">
                        {user.grade ? `${user.grade} ` : ''}{user.nom} {user.prenom}
                      </div>
                      <div className="text-[10px] text-[#5a705a]">{ROLE_LABELS[user.role] ?? user.role}</div>
                      <div className="text-[10px] text-[#5a705a] font-mono">{user.matricule}</div>
                    </>
                  ) : (
                    <div className="text-xs text-[#5a705a]">Chargement…</div>
                  )}
                </div>
                <div className="p-2">
                  <Link href="/dashboard/profil" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8fa88f] hover:text-[#e8f0e8] hover:bg-[#1a261a] transition-all">
                    <User size={13} />
                    Mon profil
                  </Link>
                  <Link href="/dashboard/securite" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8fa88f] hover:text-[#e8f0e8] hover:bg-[#1a261a] transition-all">
                    <Shield size={13} />
                    Sécurité du compte
                  </Link>
                  <Link href="/dashboard/parametres" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#8fa88f] hover:text-[#e8f0e8] hover:bg-[#1a261a] transition-all">
                    <Settings size={13} />
                    Paramètres
                  </Link>
                  <div className="border-t border-[#1e321e] mt-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={13} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
