'use client'

import { memo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Award, Building2, Target, MapPin,
  Package, Truck, Clock, Calendar, Heart, Shield, DollarSign,
  MessageSquare, FileText, BarChart3, Bell, Search, Bot,
  Settings, LogOut, Menu, X,
  Flag, Lock, Boxes, Home, Globe, GraduationCap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { clsx } from 'clsx'

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  badge?: number | string
  badgeColor?: string
  section?: boolean
  // Rôles qui peuvent voir cet item (undefined = tous les rôles authentifiés)
  roles?: string[]
}

const ALL_ROLES = ['souverain', 'super_admin', 'admin_national', 'admin_zone', 'admin_region', 'admin_provincial', 'admin_territorial', 'admin_sectoriel', 'officier_commandant', 'utilisateur_operationnel']
const NATIONAL = ['souverain', 'super_admin', 'admin_national']
const MANAGERS = [...NATIONAL, 'admin_zone', 'admin_region', 'admin_provincial', 'admin_territorial', 'admin_sectoriel', 'officier_commandant']
const GEO_ADMINS = [...NATIONAL, 'admin_zone', 'admin_region', 'admin_provincial', 'admin_territorial', 'admin_sectoriel']

const navItems: NavItem[] = [
  // ── Commandement ────────────────────────────────────────────────────────────
  { label: 'COMMANDEMENT', section: true, icon: <></> },
  { label: 'Tableau de bord', href: '/dashboard', icon: <LayoutDashboard size={16} />, roles: ALL_ROLES },
  { label: 'Centre des alertes', href: '/dashboard/alertes', icon: <Bell size={16} />, badge: 3, badgeColor: 'bg-red-500', roles: ALL_ROLES },
  { label: 'Messagerie sécurisée', href: '/dashboard/messagerie', icon: <MessageSquare size={16} />, badge: 2, badgeColor: 'bg-green-500', roles: ALL_ROLES },
  { label: 'Centre de commandement', href: '/dashboard/operations', icon: <Target size={16} />, badge: 7, badgeColor: 'bg-blue-500', roles: MANAGERS },
  { label: 'Géolocalisation GPS', href: '/dashboard/geolocalisation', icon: <MapPin size={16} />, roles: MANAGERS },

  // ── Personnel ───────────────────────────────────────────────────────────────
  { label: 'PERSONNEL', section: true, icon: <></> },
  { label: 'Personnel militaire', href: '/dashboard/personnel', icon: <Users size={16} />, roles: MANAGERS },
  { label: 'Grades & Promotions', href: '/dashboard/grades', icon: <Award size={16} />, roles: GEO_ADMINS },
  { label: 'Unités & Structure', href: '/dashboard/unites', icon: <Building2 size={16} />, roles: GEO_ADMINS },
  { label: 'Présences', href: '/dashboard/presences', icon: <Clock size={16} />, roles: MANAGERS },
  { label: 'Permissions & Congés', href: '/dashboard/permissions', icon: <Calendar size={16} />, roles: MANAGERS },

  // ── Opérations ──────────────────────────────────────────────────────────────
  { label: 'OPÉRATIONS', section: true, icon: <></>, roles: MANAGERS },
  { label: 'Zones & Régions Militaires', href: '/dashboard/zones-regions', icon: <Globe size={16} />, roles: NATIONAL },
  { label: 'Bases & Casernes', href: '/dashboard/bases', icon: <Home size={16} />, roles: GEO_ADMINS },
  { label: 'Centres de Formation', href: '/dashboard/centres-formation', icon: <GraduationCap size={16} />, roles: GEO_ADMINS },

  // ── Logistique ──────────────────────────────────────────────────────────────
  { label: 'LOGISTIQUE', section: true, icon: <></>, roles: GEO_ADMINS },
  { label: 'Logistique & Transferts', href: '/dashboard/logistique', icon: <Boxes size={16} />, badge: 1, badgeColor: 'bg-red-500', roles: GEO_ADMINS },
  { label: 'Armements & Équipements', href: '/dashboard/equipements', icon: <Package size={16} />, roles: GEO_ADMINS },
  { label: 'Flotte de véhicules', href: '/dashboard/vehicules', icon: <Truck size={16} />, roles: GEO_ADMINS },
  { label: 'Gestion financière', href: '/dashboard/financier', icon: <DollarSign size={16} />, roles: GEO_ADMINS },

  // ── Administration ──────────────────────────────────────────────────────────
  { label: 'ADMINISTRATION', section: true, icon: <></>, roles: MANAGERS },
  { label: 'Dossiers médicaux', href: '/dashboard/medical', icon: <Heart size={16} />, roles: GEO_ADMINS },
  { label: 'Disciplinaire', href: '/dashboard/disciplinaire', icon: <Shield size={16} />, roles: GEO_ADMINS },
  { label: 'Documents & Archives', href: '/dashboard/documents', icon: <FileText size={16} />, roles: GEO_ADMINS },
  { label: 'Rapports & Statistiques', href: '/dashboard/rapports', icon: <BarChart3 size={16} />, roles: MANAGERS },
  { label: "Journal d'audit", href: '/dashboard/audit', icon: <Search size={16} />, roles: NATIONAL },

  // ── Système ─────────────────────────────────────────────────────────────────
  { label: 'SYSTÈME', section: true, icon: <></>, roles: NATIONAL },
  { label: 'Module IA', href: '/dashboard/ia', icon: <Bot size={16} />, badge: 'BÊTA', badgeColor: 'bg-purple-500', roles: NATIONAL },
  { label: 'Administration', href: '/dashboard/administration', icon: <Settings size={16} />, roles: NATIONAL },
]

const roleLabels: Record<string, { label: string; color: string }> = {
  souverain:              { label: 'Présidence — Souverain',       color: 'text-yellow-400' },
  super_admin:            { label: 'Super Administrateur',         color: 'text-red-400' },
  admin_national:         { label: 'Admin National — Min. Défense', color: 'text-orange-400' },
  admin_zone:             { label: 'Admin Zone Militaire',         color: 'text-blue-400' },
  admin_region:           { label: 'Admin Région Militaire',       color: 'text-cyan-400' },
  admin_provincial:       { label: 'Admin Provincial',             color: 'text-teal-400' },
  admin_territorial:      { label: 'Admin Territorial',            color: 'text-emerald-400' },
  admin_sectoriel:        { label: 'Admin Sectoriel',              color: 'text-green-400' },
  officier_commandant:    { label: 'Officier Commandant',          color: 'text-[#8fa88f]' },
  utilisateur_operationnel: { label: 'Utilisateur Opérationnel',  color: 'text-[#5a705a]' },
}

const ScopeTag = ({ scope }: { scope?: { zone?: string | null; region?: string | null; province?: string | null; territoire?: string | null; secteur?: string | null } | null }) => {
  const parts = [scope?.zone, scope?.region, scope?.province, scope?.territoire, scope?.secteur].filter(Boolean)
  if (!parts.length) return null
  return (
    <div className="mt-1 px-2 py-0.5 rounded bg-[#1e321e]/60 border border-[#2a4a2a]">
      <div className="flex items-center gap-1">
        <MapPin size={8} className="text-green-500 flex-shrink-0" />
        <span className="text-[9px] text-[#5a705a] truncate">{parts.join(' › ')}</span>
      </div>
    </div>
  )
}

const SidebarContent = memo(function SidebarContent({
  pathname,
  collapsed,
  setCollapsed,
  user,
  logout,
  onLinkClick,
}: {
  pathname: string
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  user: ReturnType<typeof useAuth>['user']
  logout: () => void
  onLinkClick?: () => void
}) {
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  useEffect(() => { setPendingHref(null) }, [pathname])

  const userRole = user?.role || 'utilisateur_operationnel'
  const roleInfo = roleLabels[userRole] ?? { label: userRole, color: 'text-[#5a705a]' }

  const initials = user
    ? `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase()
    : '?'

  // Filtre les items selon le rôle
  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  return (
    <div className={clsx('flex flex-col h-full transition-all duration-300', collapsed ? 'w-16' : 'w-64')}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e321e]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Flag size={14} className="text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-green-400 tracking-wider leading-none">MILSYS RDC</div>
              <div className="text-[9px] text-[#5a705a] tracking-widest leading-none mt-0.5">FARDC — ERP Militaire</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto">
            <Flag size={14} className="text-white" />
          </div>
        )}
        <button
          type="button"
          aria-label={collapsed ? 'Développer la barre latérale' : 'Réduire la barre latérale'}
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#5a705a] hover:text-[#e8f0e8] transition-colors p-1 rounded hidden lg:flex"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Profil utilisateur */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[#1e321e] bg-[#0f1a0f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-800 flex items-center justify-center text-white text-xs font-bold border border-green-600/40 flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-[#e8f0e8] truncate">
                {user?.grade ? `${user.grade} ` : ''}{user?.prenom} {user?.nom}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-live" />
                <span className={clsx('text-[9px] truncate', roleInfo.color)}>{roleInfo.label}</span>
              </div>
              <ScopeTag scope={user?.scope} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {visibleItems.map((item, idx) => {
          if (item.section) {
            if (collapsed) return null
            return (
              <div key={idx} className="section-title pt-3 pb-1">
                {item.label}
              </div>
            )
          }

          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href!)
          const showActive = isActive || pendingHref === item.href

          return (
            <Link
              key={idx}
              href={item.href!}
              onClick={() => { setPendingHref(item.href!); onLinkClick?.() }}
              className={clsx('sidebar-link', showActive && 'active', collapsed && 'justify-center px-2')}
              title={collapsed ? item.label : undefined}
            >
              <span className={clsx('flex-shrink-0', showActive ? 'text-green-400' : '')}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none', item.badgeColor || 'bg-gray-600')}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e321e] p-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
              <Lock size={12} className="text-green-500" />
              <span className="text-[10px] text-[#5a705a]">Connexion sécurisée · Audit actif</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#5a705a] hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
            >
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center py-2 rounded-lg text-[#5a705a] hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  )
})

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <>
      {/* Desktop */}
      <aside className={clsx(
        'hidden lg:flex flex-col bg-[#0a110a] border-r border-[#1e321e] h-screen sticky top-0 overflow-hidden transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent pathname={pathname} collapsed={collapsed} setCollapsed={setCollapsed} user={user} logout={logout} />
      </aside>

      {/* Mobile toggle */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#141e14] border border-[#1e321e] rounded-lg text-[#e8f0e8]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0a110a] border-r border-[#1e321e] overflow-y-auto">
            <SidebarContent pathname={pathname} collapsed={false} setCollapsed={() => {}} user={user} logout={logout} onLinkClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
