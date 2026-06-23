'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Award, Building2, Calendar, Edit3, Camera, Shield, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useAuth } from '@/context/AuthContext'
import { clsx } from 'clsx'

const ROLE_LABELS: Record<string, string> = {
  souverain: 'Souverain',
  super_admin: 'Super Administrateur',
  admin_national: 'Administrateur National',
  admin_zone: 'Administrateur de Zone',
  admin_region: 'Administrateur Régional',
  admin_provincial: 'Administrateur Provincial',
  admin_territorial: 'Administrateur Territorial',
  admin_sectoriel: 'Administrateur Sectoriel',
  officier_commandant: 'Officier Commandant',
  utilisateur_operationnel: 'Utilisateur Opérationnel',
}

const Field = ({ label, value, icon }: { label: string; value?: string | null; icon: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
    <div className="mt-0.5 text-green-500 flex-shrink-0">{icon}</div>
    <div>
      <div className="text-[10px] text-[#5a705a] uppercase tracking-wider">{label}</div>
      <div className="text-sm text-[#e8f0e8] mt-0.5">{value || <span className="text-[#5a705a] italic">Non renseigné</span>}</div>
    </div>
  </div>
)

export default function ProfilPage() {
  const { user, nomComplet } = useAuth()
  const [tab, setTab] = useState<'info' | 'activite'>('info')

  const initials = user
    ? `${(user.prenom?.[0] ?? '').toUpperCase()}${(user.nom?.[0] ?? '').toUpperCase()}`
    : '?'

  const dernierLogin = user?.dernierLogin
    ? new Date(user.dernierLogin).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
    : 'Inconnu'

  return (
    <div className="flex flex-col min-h-screen bg-[#050d05]">
      <Header title="Mon profil" subtitle="Informations personnelles et activité du compte" />

      <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">

        {/* Avatar + identité */}
        <div className="relative bg-[#0a110a] border border-[#1e321e] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-green-800 flex items-center justify-center text-white text-3xl font-bold border-2 border-green-600/50">
                {initials}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center transition-colors"
                title="Changer la photo"
              >
                <Camera size={13} className="text-white" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-[#e8f0e8]">{nomComplet || '—'}</h2>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                {user?.role && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                )}
                {user?.grade && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    {user.grade}
                  </span>
                )}
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                  user?.actif
                    ? 'bg-green-500/15 text-green-400 border-green-500/30'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                )}>
                  {user?.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="mt-3 text-xs text-[#5a705a] font-mono">
                Matricule : <span className="text-green-400">{user?.matricule ?? '—'}</span>
              </div>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1e321e] text-xs text-[#8fa88f] hover:text-[#e8f0e8] hover:border-green-500/40 transition-all"
            >
              <Edit3 size={13} />
              Modifier
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 bg-[#0a110a] border border-[#1e321e] rounded-xl p-1">
          {(['info', 'activite'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={clsx(
                'flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                tab === t
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : 'text-[#5a705a] hover:text-[#8fa88f]'
              )}
            >
              {t === 'info' ? 'Informations' : 'Activité'}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="space-y-4">
            <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-[#8fa88f] uppercase tracking-wider mb-4">Identité</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nom" value={user?.nom} icon={<User size={14} />} />
                <Field label="Prénom" value={user?.prenom} icon={<User size={14} />} />
                <Field label="Email" value={user?.email} icon={<Mail size={14} />} />
                <Field label="Matricule" value={user?.matricule} icon={<Shield size={14} />} />
              </div>
            </div>

            <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-[#8fa88f] uppercase tracking-wider mb-4">Affectation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Grade" value={user?.grade} icon={<Award size={14} />} />
                <Field label="Unité" value={user?.unite?.nom} icon={<Building2 size={14} />} />
                <Field label="Rôle système" value={ROLE_LABELS[user?.role ?? ''] ?? user?.role} icon={<Shield size={14} />} />
                {user?.scope?.province && (
                  <Field label="Province" value={user.scope.province} icon={<MapPin size={14} />} />
                )}
              </div>
            </div>

            <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-[#8fa88f] uppercase tracking-wider mb-4">Permissions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {user?.permissions && Object.entries(user.permissions).map(([key, val]) => (
                  <div key={key} className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs',
                    val
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-[#0f1a0f] border-[#1e321e] text-[#5a705a]'
                  )}>
                    <div className={clsx('w-1.5 h-1.5 rounded-full', val ? 'bg-green-400' : 'bg-[#5a705a]')} />
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'activite' && (
          <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-[#8fa88f] uppercase tracking-wider">Activité du compte</h3>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
              <Clock size={14} className="text-green-500" />
              <div>
                <div className="text-[10px] text-[#5a705a]">Dernière connexion</div>
                <div className="text-sm text-[#e8f0e8]">{dernierLogin}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
              <Calendar size={14} className="text-blue-500" />
              <div>
                <div className="text-[10px] text-[#5a705a]">Authentification à deux facteurs</div>
                <div className={clsx('text-sm', user?.mfaEnabled ? 'text-green-400' : 'text-orange-400')}>
                  {user?.mfaEnabled ? 'Activée' : 'Non activée'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
              <Phone size={14} className="text-purple-500" />
              <div>
                <div className="text-[10px] text-[#5a705a]">État du compte</div>
                <div className={clsx('text-sm', user?.actif ? 'text-green-400' : 'text-red-400')}>
                  {user?.actif ? 'Compte actif' : 'Compte désactivé'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
