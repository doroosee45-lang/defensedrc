'use client'

import { useState } from 'react'
import { Shield, Key, Smartphone, Eye, EyeOff, CheckCircle, AlertTriangle, Lock, Clock, Monitor } from 'lucide-react'
import Header from '@/components/layout/Header'
import { useAuth } from '@/context/AuthContext'
import { clsx } from 'clsx'

interface PasswordForm {
  actuel: string
  nouveau: string
  confirmer: string
}

const StrengthBar = ({ password }: { password: string }) => {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort']
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={clsx('h-1 flex-1 rounded-full transition-all', i < score ? colors[score - 1] : 'bg-[#1e321e]')} />
        ))}
      </div>
      <div className={clsx('text-[10px] mt-1', score < 2 ? 'text-red-400' : score < 3 ? 'text-yellow-400' : 'text-green-400')}>
        {password && labels[score - 1]}
      </div>
    </div>
  )
}

export default function SecuritePage() {
  const { user } = useAuth()
  const [form, setForm] = useState<PasswordForm>({ actuel: '', nouveau: '', confirmer: '' })
  const [show, setShow] = useState({ actuel: false, nouveau: false, confirmer: false })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const match = form.nouveau === form.confirmer
  const canSubmit = form.actuel && form.nouveau.length >= 8 && match && !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      // Appel API changement de mot de passe
      await new Promise(r => setTimeout(r, 1200)) // placeholder
      setSuccess(true)
      setForm({ actuel: '', nouveau: '', confirmer: '' })
    } catch {
      setError('Mot de passe actuel incorrect ou erreur serveur.')
    } finally {
      setSaving(false)
    }
  }

  const toggle = (field: keyof typeof show) =>
    setShow(s => ({ ...s, [field]: !s[field] }))

  const InputField = ({
    label, field, placeholder
  }: { label: string; field: keyof PasswordForm; placeholder?: string }) => (
    <div>
      <label className="block text-xs text-[#8fa88f] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          placeholder={placeholder}
          className="w-full bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#e8f0e8] placeholder-[#5a705a] focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
        />
        <button
          type="button"
          onClick={() => toggle(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a705a] hover:text-[#8fa88f] transition-colors"
        >
          {show[field] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {field === 'nouveau' && <StrengthBar password={form.nouveau} />}
      {field === 'confirmer' && form.confirmer && !match && (
        <div className="text-[10px] text-red-400 mt-1">Les mots de passe ne correspondent pas</div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-[#050d05]">
      <Header title="Sécurité du compte" subtitle="Gestion du mot de passe et authentification" />

      <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">

        {/* Statut sécurité */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center">
              <Lock size={16} className="text-green-400" />
            </div>
            <div>
              <div className="text-[10px] text-[#5a705a]">Mot de passe</div>
              <div className="text-sm text-green-400 font-medium">Défini</div>
            </div>
          </div>

          <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4 flex items-center gap-3">
            <div className={clsx(
              'w-9 h-9 rounded-full flex items-center justify-center',
              user?.mfaEnabled ? 'bg-green-500/15' : 'bg-orange-500/15'
            )}>
              <Smartphone size={16} className={user?.mfaEnabled ? 'text-green-400' : 'text-orange-400'} />
            </div>
            <div>
              <div className="text-[10px] text-[#5a705a]">Double authentification</div>
              <div className={clsx('text-sm font-medium', user?.mfaEnabled ? 'text-green-400' : 'text-orange-400')}>
                {user?.mfaEnabled ? 'Activée' : 'Non activée'}
              </div>
            </div>
          </div>

          <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Monitor size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] text-[#5a705a]">Sessions actives</div>
              <div className="text-sm text-blue-400 font-medium">1 session</div>
            </div>
          </div>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Key size={16} className="text-green-500" />
            <h3 className="text-sm font-semibold text-[#e8f0e8]">Changer le mot de passe</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <InputField label="Mot de passe actuel" field="actuel" placeholder="••••••••" />
            <InputField label="Nouveau mot de passe" field="nouveau" placeholder="Minimum 8 caractères" />
            <InputField label="Confirmer le nouveau mot de passe" field="confirmer" placeholder="••••••••" />

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-400">
                <CheckCircle size={14} />
                Mot de passe modifié avec succès
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={clsx(
                'w-full py-2.5 rounded-lg text-sm font-medium transition-all',
                canSubmit
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-[#1e321e] text-[#5a705a] cursor-not-allowed'
              )}
            >
              {saving ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>

        {/* Double authentification */}
        <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={16} className="text-green-500" />
              <div>
                <h3 className="text-sm font-semibold text-[#e8f0e8]">Authentification à deux facteurs (2FA)</h3>
                <p className="text-xs text-[#5a705a] mt-0.5">Application TOTP (Google Authenticator, Authy…)</p>
              </div>
            </div>
            <div className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium border',
              user?.mfaEnabled
                ? 'bg-green-500/15 text-green-400 border-green-500/30'
                : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
            )}>
              {user?.mfaEnabled ? 'Activée' : 'Désactivée'}
            </div>
          </div>

          {!user?.mfaEnabled && (
            <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-2">
              <AlertTriangle size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-300">
                Pour renforcer la sécurité de votre compte militaire, activez la double authentification.
                Contactez votre administrateur système pour configurer votre application TOTP.
              </p>
            </div>
          )}
        </div>

        {/* Journal de sécurité */}
        <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-green-500" />
            <h3 className="text-sm font-semibold text-[#e8f0e8]">Journal de sécurité</h3>
          </div>
          <div className="space-y-2">
            {[
              { action: 'Connexion réussie', date: user?.dernierLogin, icon: <CheckCircle size={12} />, color: 'text-green-400' },
              { action: 'Authentification MFA', date: user?.dernierLogin, icon: <Shield size={12} />, color: 'text-blue-400' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
                <span className={log.color}>{log.icon}</span>
                <div className="flex-1">
                  <div className="text-xs text-[#e8f0e8]">{log.action}</div>
                  <div className="text-[10px] text-[#5a705a]">
                    {log.date ? new Date(log.date).toLocaleString('fr-FR') : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
