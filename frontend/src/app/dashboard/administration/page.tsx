'use client'

import { useState, useEffect } from 'react'
import { Users, Shield, Lock, Activity, Plus, Edit2, Key, Server, Eye, EyeOff, AlertTriangle, CheckCircle, RefreshCw, UserX, UserCheck } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import administrationService from '@/services/administration.service'
import type { AuthUser } from '@/context/AuthContext'
import { clsx } from 'clsx'

const ROLE_OPTIONS = [
  { value: 'souverain',               label: 'Souverain' },
  { value: 'super_admin',             label: 'Super Administrateur' },
  { value: 'admin_national',          label: 'Admin National' },
  { value: 'admin_zone',              label: 'Admin Zone Militaire' },
  { value: 'admin_region',            label: 'Admin Région Militaire' },
  { value: 'admin_provincial',        label: 'Admin Provincial' },
  { value: 'admin_territorial',       label: 'Admin Territorial' },
  { value: 'admin_sectoriel',         label: 'Admin Sectoriel' },
  { value: 'officier_commandant',     label: 'Officier Commandant' },
  { value: 'utilisateur_operationnel', label: 'Utilisateur Opérationnel' },
]

const systemStatus = [
  { service: 'API Backend',               statut: 'operationnel', uptime: '99.98%', version: 'v2.4.1' },
  { service: 'Base de données MongoDB',   statut: 'operationnel', uptime: '99.99%', version: 'Atlas' },
  { service: 'Authentification JWT',      statut: 'operationnel', uptime: '100%',   version: 'v2.0' },
  { service: 'Serveur GPS/Tracking',      statut: 'operationnel', uptime: '99.95%', version: 'v1.3' },
  { service: 'Module Messagerie',         statut: 'operationnel', uptime: '99.97%', version: 'v2.1' },
  { service: 'Elasticsearch',             statut: 'maintenance',  uptime: '98.5%',  version: 'v8.10' },
]

// ── Formulaire utilisateur ────────────────────────────────────────────────────

interface UserForm {
  matricule: string; nom: string; prenom: string; email: string
  role: string; grade: string; password: string; confirmPassword: string
}

const emptyUserForm: UserForm = {
  matricule: '', nom: '', prenom: '', email: '',
  role: 'utilisateur_operationnel', grade: '', password: '', confirmPassword: '',
}

// ── Composant champ texte ─────────────────────────────────────────────────────

const Field = ({
  label, value, onChange, type = 'text', placeholder, required
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) => (
  <div>
    <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="mil-input"
    />
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<'utilisateurs' | 'roles' | 'systeme' | 'securite'>('utilisateurs')
  const [utilisateurs, setUtilisateurs] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // ── Modals ────────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate]               = useState(false)
  const [showEdit, setShowEdit]                   = useState(false)
  const [showResetPwd, setShowResetPwd]           = useState(false)
  const [showToggleConfirm, setShowToggleConfirm] = useState(false)
  const [targetUser, setTargetUser]               = useState<AuthUser | null>(null)

  // ── Formulaire ────────────────────────────────────────────────────────────
  const [form, setForm]     = useState<UserForm>(emptyUserForm)
  const [saving, setSaving] = useState(false)
  const [showPwd, setShowPwd]         = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPwd, setShowNewPwd]   = useState(false)

  const setField = (key: keyof UserForm) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const flash = (msg: string, isError = false) => {
    if (isError) { setActionError(msg); setTimeout(() => setActionError(''), 4000) }
    else         { setActionSuccess(msg); setTimeout(() => setActionSuccess(''), 4000) }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    setIsLoading(true)
    administrationService.getAllUsers()
      .then(r => setUtilisateurs((r.data as AuthUser[]) ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  // ── Créer un utilisateur ─────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.matricule || !form.nom || !form.prenom || !form.password) return
    if (form.password !== form.confirmPassword) { flash('Les mots de passe ne correspondent pas.', true); return }
    if (form.password.length < 8) { flash('Mot de passe trop court (8 caractères minimum).', true); return }
    setSaving(true)
    try {
      await administrationService.createUser({
        matricule: form.matricule, nom: form.nom, prenom: form.prenom,
        email: form.email, role: form.role, grade: form.grade, password: form.password,
      })
      setShowCreate(false)
      setForm(emptyUserForm)
      loadUsers()
      flash(`Utilisateur ${form.prenom} ${form.nom} créé avec succès.`)
    } catch (e: unknown) {
      flash((e as { message?: string })?.message ?? 'Erreur lors de la création.', true)
    } finally { setSaving(false) }
  }

  // ── Modifier un utilisateur ───────────────────────────────────────────────
  const openEdit = (u: AuthUser) => {
    setTargetUser(u)
    setForm({ matricule: u.matricule, nom: u.nom, prenom: u.prenom, email: u.email ?? '',
              role: u.role, grade: u.grade ?? '', password: '', confirmPassword: '' })
    setShowEdit(true)
  }

  const handleEdit = async () => {
    if (!targetUser || !form.nom || !form.prenom) return
    setSaving(true)
    try {
      await administrationService.updateUser(targetUser._id, {
        nom: form.nom, prenom: form.prenom, email: form.email,
        role: form.role, grade: form.grade,
      })
      setShowEdit(false)
      setTargetUser(null)
      setForm(emptyUserForm)
      loadUsers()
      flash('Utilisateur modifié avec succès.')
    } catch (e: unknown) {
      flash((e as { message?: string })?.message ?? 'Erreur lors de la modification.', true)
    } finally { setSaving(false) }
  }

  // ── Réinitialiser le mot de passe ────────────────────────────────────────
  const openResetPwd = (u: AuthUser) => {
    setTargetUser(u)
    setNewPassword('')
    setShowResetPwd(true)
  }

  const handleResetPwd = async () => {
    if (!targetUser || newPassword.length < 8) { flash('Mot de passe trop court (8 caractères minimum).', true); return }
    setSaving(true)
    try {
      await administrationService.resetPassword(targetUser._id, newPassword)
      setShowResetPwd(false)
      setTargetUser(null)
      setNewPassword('')
      flash('Mot de passe réinitialisé avec succès.')
    } catch (e: unknown) {
      flash((e as { message?: string })?.message ?? 'Erreur lors de la réinitialisation.', true)
    } finally { setSaving(false) }
  }

  // ── Activer / Désactiver ─────────────────────────────────────────────────
  const openToggle = (u: AuthUser) => { setTargetUser(u); setShowToggleConfirm(true) }

  const handleToggle = async () => {
    if (!targetUser) return
    setSaving(true)
    try {
      await administrationService.toggleUser(targetUser._id)
      setShowToggleConfirm(false)
      setTargetUser(null)
      loadUsers()
      flash('Statut mis à jour avec succès.')
    } catch (e: unknown) {
      flash((e as { message?: string })?.message ?? 'Erreur.', true)
    } finally { setSaving(false) }
  }

  // ── Formulaire utilisateur (create + edit partagent le même JSX) ──────────
  const UserFormFields = ({ withPassword }: { withPassword: boolean }) => (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Matricule" value={form.matricule} onChange={setField('matricule')} placeholder="MIL-2024-001" required />
      <Field label="Nom" value={form.nom} onChange={setField('nom')} placeholder="Nom de famille" required />
      <Field label="Prénom" value={form.prenom} onChange={setField('prenom')} placeholder="Prénom" required />
      <Field label="Email" value={form.email} onChange={setField('email')} type="email" placeholder="email@fardc.cd" />
      <Field label="Grade" value={form.grade} onChange={setField('grade')} placeholder="ex: Général, Colonel…" />
      <div>
        <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">
          Rôle <span className="text-red-400">*</span>
        </label>
        <select
          aria-label="Rôle"
          value={form.role}
          onChange={e => setField('role')(e.target.value)}
          className="mil-select"
        >
          {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {withPassword && (
        <>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">
              Mot de passe <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setField('password')(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="mil-input pr-9"
              />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a705a] hover:text-[#8fa88f]">
                {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">
              Confirmer le mot de passe <span className="text-red-400">*</span>
            </label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setField('confirmPassword')(e.target.value)}
              placeholder="Répéter le mot de passe"
              className="mil-input"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      <Header title="Administration système" subtitle="Gestion des accès, rôles et configuration MILSYS RDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Feedback global */}
        {actionSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400">
            <CheckCircle size={14} /> {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
            <AlertTriangle size={14} /> {actionError}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Utilisateurs actifs" value={isLoading ? '…' : utilisateurs.filter(u => u.actif).length} icon={<Users size={16} />} color="green" size="sm" />
          <StatCard title="Services en ligne"   value={systemStatus.filter(s => s.statut === 'operationnel').length}                           icon={<Server size={16} />} color="blue"   size="sm" />
          <StatCard title="Rôles configurés"    value={ROLE_OPTIONS.length}                                                                     icon={<Shield size={16} />} color="yellow" size="sm" />
          <StatCard title="Total utilisateurs"  value={isLoading ? '…' : utilisateurs.length}                                                   icon={<Users size={16} />} color="red" size="sm" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#0f1a0f] border border-[#1e321e] rounded-xl p-1 w-fit flex-wrap">
          {(['utilisateurs', 'roles', 'systeme', 'securite'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-medium transition-all',
                activeTab === tab ? 'bg-green-600 text-white' : 'text-[#5a705a] hover:text-[#e8f0e8]'
              )}
            >
              {tab === 'utilisateurs' ? 'Utilisateurs' : tab === 'roles' ? 'Rôles & Permissions' : tab === 'systeme' ? 'État du système' : 'Sécurité'}
            </button>
          ))}
        </div>

        {/* ── Onglet Utilisateurs ─────────────────────────────────────────── */}
        {activeTab === 'utilisateurs' && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-green-400" />
                <span className="text-sm font-semibold text-[#e8f0e8]">Gestion des utilisateurs</span>
                {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={loadUsers} className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all" title="Rafraîchir">
                  <RefreshCw size={14} />
                </button>
                <button type="button" onClick={() => { setForm(emptyUserForm); setShowCreate(true) }} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                  <Plus size={13} /> Nouvel utilisateur
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {utilisateurs.length === 0 && !isLoading ? (
                <div className="py-12 text-center text-[#5a705a] text-xs">Aucun utilisateur trouvé.</div>
              ) : (
                <table className="w-full mil-table">
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Dernière connexion</th>
                      <th>Statut</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilisateurs.map(u => (
                      <tr key={u._id}>
                        <td><span className="font-mono text-[11px] text-green-400">{u.matricule}</span></td>
                        <td>
                          <div>
                            <div className="text-xs font-medium text-[#e8f0e8]">{u.nom} {u.prenom}</div>
                            <div className="text-[10px] text-[#5a705a]">{u.grade ?? '—'} · {u.email ?? '—'}</div>
                          </div>
                        </td>
                        <td><span className="text-xs text-[#8fa88f]">{ROLE_OPTIONS.find(r => r.value === u.role)?.label ?? u.role}</span></td>
                        <td><span className="text-[11px] font-mono text-[#5a705a]">{u.dernierLogin ? new Date(u.dernierLogin).toLocaleString('fr-FR') : '—'}</span></td>
                        <td><Badge label={u.actif ? 'Actif' : 'Inactif'} variant={u.actif ? 'actif' : 'retraite'} dot /></td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" title="Modifier" onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg text-[#5a705a] hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                              <Edit2 size={13} />
                            </button>
                            <button type="button" title="Réinitialiser mot de passe" onClick={() => openResetPwd(u)}
                              className="p-1.5 rounded-lg text-[#5a705a] hover:text-yellow-400 hover:bg-yellow-500/10 transition-all">
                              <Key size={13} />
                            </button>
                            <button type="button" title={u.actif ? 'Désactiver' : 'Activer'} onClick={() => openToggle(u)}
                              className={clsx('p-1.5 rounded-lg transition-all',
                                u.actif ? 'text-[#5a705a] hover:text-red-400 hover:bg-red-500/10' : 'text-[#5a705a] hover:text-green-400 hover:bg-green-500/10')}>
                              {u.actif ? <UserX size={13} /> : <UserCheck size={13} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Onglet Rôles ────────────────────────────────────────────────── */}
        {activeTab === 'roles' && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center gap-2">
              <Shield size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Rôles et niveaux d&apos;accès</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { niveau: 10, role: 'Souverain',                  acteurs: 'Présidence de la République',  droits: 'Lecture stratégique uniquement. Tableaux de bord nationaux.',                   color: 'border-l-yellow-400' },
                { niveau: 9,  role: 'Super Administrateur',        acteurs: 'Ministère de la Défense',      droits: 'Administration complète. Paramétrage global. Tous modules.',                    color: 'border-l-red-500' },
                { niveau: 8,  role: 'Admin National',              acteurs: 'État-Major Général',           droits: 'Gestion opérations nationales. Supervision tous niveaux.',                      color: 'border-l-orange-500' },
                { niveau: 7,  role: 'Admin Zone Militaire',        acteurs: 'Commandants de Zone',          droits: 'Gestion zone. Personnel, opérations et ressources de la zone.',                 color: 'border-l-blue-400' },
                { niveau: 6,  role: 'Admin Région Militaire',      acteurs: 'Commandants de Région',        droits: 'Gestion régionale. Personnel, missions, ressources.',                           color: 'border-l-cyan-500' },
                { niveau: 5,  role: 'Admin Provincial',            acteurs: 'Administration Provinciale',   droits: 'Gestion province. Contrôle et supervision.',                                    color: 'border-l-purple-500' },
                { niveau: 4,  role: 'Admin Territorial',           acteurs: 'Administration Territoriale',  droits: 'Gestion territoire/brigade. Présences, équipements.',                           color: 'border-l-indigo-500' },
                { niveau: 3,  role: 'Admin Sectoriel',             acteurs: 'Administration Sectorielle',   droits: 'Gestion quotidienne secteur. Présences, équipements.',                          color: 'border-l-green-500' },
                { niveau: 2,  role: 'Officier Commandant',         acteurs: 'Commandants d\'Unités',        droits: 'Gestion unité. Validation demandes. Rapports.',                                 color: 'border-l-teal-500' },
                { niveau: 1,  role: 'Utilisateur Opérationnel',   acteurs: 'Officiers / Sous-officiers',   droits: 'Consultation données personnelles. Messagerie. Demandes.',                      color: 'border-l-gray-500' },
              ].map(r => (
                <div key={r.niveau} className={clsx('border border-l-4 border-[#1e321e] rounded-xl px-4 py-3 bg-[#0f1a0f]', r.color)}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1a261a] border border-[#1e321e] flex items-center justify-center text-xs font-bold text-green-400 flex-shrink-0">
                      {r.niveau}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#e8f0e8] mb-0.5">{r.role}</div>
                      <div className="text-[10px] text-[#5a705a] mb-0.5">Acteurs : {r.acteurs}</div>
                      <div className="text-[10px] text-[#8fa88f]">{r.droits}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Onglet Système ──────────────────────────────────────────────── */}
        {activeTab === 'systeme' && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center gap-2">
              <Server size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">État des services système</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-live" />
                <span className="text-[10px] text-green-400">Surveillance active</span>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {systemStatus.map(s => (
                <div key={s.service} className="flex items-center justify-between p-3 bg-[#0f1a0f] border border-[#1e321e] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={clsx('w-2 h-2 rounded-full', s.statut === 'operationnel' ? 'bg-green-400 status-live' : 'bg-yellow-400')} />
                    <div>
                      <div className="text-xs font-medium text-[#e8f0e8]">{s.service}</div>
                      <div className="text-[10px] text-[#5a705a]">{s.version}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-[#5a705a]">Disponibilité</div>
                      <div className={clsx('text-xs font-bold', s.statut === 'operationnel' ? 'text-green-400' : 'text-yellow-400')}>{s.uptime}</div>
                    </div>
                    <Badge label={s.statut === 'operationnel' ? 'Opérationnel' : 'Maintenance'} variant={s.statut === 'operationnel' ? 'actif' : 'en_attente'} dot />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Onglet Sécurité ─────────────────────────────────────────────── */}
        {activeTab === 'securite' && (
          <div className="space-y-4">
            <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8] mb-3 flex items-center gap-2">
                <Lock size={14} className="text-green-400" />
                Configuration de sécurité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Authentification MFA',             valeur: 'Obligatoire' },
                  { label: 'Chiffrement AES-256',              valeur: 'Activé' },
                  { label: 'TLS 1.3',                          valeur: 'Activé' },
                  { label: 'HSM (Hardware Security Module)',   valeur: 'Connecté' },
                  { label: 'WAF (Web Application Firewall)',   valeur: 'Actif' },
                  { label: 'IDS/IPS (Détection intrusion)',    valeur: 'Actif' },
                  { label: 'Sauvegarde automatique',          valeur: 'Quotidienne 02h00' },
                  { label: 'Rotation mots de passe',          valeur: 'Tous les 90 jours' },
                  { label: 'Verrouillage après échecs',        valeur: '5 tentatives' },
                  { label: 'Conservation journaux',            valeur: '10 ans minimum' },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between p-3 bg-[#0f1a0f] border border-[#1e321e] rounded-xl">
                    <div>
                      <div className="text-xs text-[#8fa88f]">{c.label}</div>
                      <div className="text-xs font-medium text-[#e8f0e8]">{c.valeur}</div>
                    </div>
                    <Badge label="Actif" variant="actif" dot size="xs" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8] mb-3 flex items-center gap-2">
                <Activity size={14} className="text-green-400" />
                Politique de gouvernance des accès
              </h3>
              <div className="space-y-2">
                {[
                  'Principe du moindre privilège : chaque utilisateur accède uniquement aux données nécessaires.',
                  'Séparation des fonctions : aucun utilisateur ne peut créer, valider ET payer une action.',
                  'Revue semestrielle des droits d\'accès par l\'administrateur national.',
                  'Révocation immédiate des accès en cas de départ, mutation ou sanction.',
                  'Impossibilité technique de modifier ou supprimer les journaux d\'audit.',
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-[#0f1a0f] border border-[#1e321e] rounded-lg">
                    <span className="text-green-400 text-[11px] mt-0.5">◆</span>
                    <span className="text-[11px] text-[#8fa88f]">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Créer utilisateur ─────────────────────────────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setForm(emptyUserForm) }}
        title="Créer un nouvel utilisateur"
        subtitle="Compte d'accès au système MILSYS RDC"
        size="xl"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setShowCreate(false); setForm(emptyUserForm) }}>Annuler</button>
            <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={handleCreate} disabled={saving || !form.matricule || !form.nom || !form.prenom || !form.password}>
              {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              <Plus size={12} /> Créer l&apos;utilisateur
            </button>
          </>
        }
      >
        <UserFormFields withPassword />
      </Modal>

      {/* ── Modal Modifier utilisateur ──────────────────────────────────────── */}
      <Modal
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setTargetUser(null); setForm(emptyUserForm) }}
        title="Modifier l'utilisateur"
        subtitle={targetUser ? `Matricule : ${targetUser.matricule}` : ''}
        size="xl"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setShowEdit(false); setTargetUser(null); setForm(emptyUserForm) }}>Annuler</button>
            <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={handleEdit} disabled={saving || !form.nom || !form.prenom}>
              {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              Enregistrer les modifications
            </button>
          </>
        }
      >
        <UserFormFields withPassword={false} />
      </Modal>

      {/* ── Modal Réinitialiser mot de passe ────────────────────────────────── */}
      <Modal
        isOpen={showResetPwd}
        onClose={() => { setShowResetPwd(false); setTargetUser(null); setNewPassword('') }}
        title="Réinitialiser le mot de passe"
        subtitle={targetUser ? `${targetUser.prenom} ${targetUser.nom} — ${targetUser.matricule}` : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setShowResetPwd(false); setTargetUser(null); setNewPassword('') }}>Annuler</button>
            <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={handleResetPwd} disabled={saving || newPassword.length < 8}>
              {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              <Key size={12} /> Réinitialiser
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2 text-xs text-yellow-300">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            Le nouveau mot de passe sera communiqué à l&apos;utilisateur. L&apos;ancien mot de passe sera immédiatement invalidé.
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Nouveau mot de passe *</label>
            <div className="relative">
              <input
                type={showNewPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="mil-input pr-9"
              />
              <button type="button" onClick={() => setShowNewPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a705a] hover:text-[#8fa88f]">
                {showNewPwd ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-[10px] text-red-400 mt-1">Minimum 8 caractères requis</p>
            )}
          </div>
        </div>
      </Modal>

      {/* ── Modal Activer / Désactiver ──────────────────────────────────────── */}
      <Modal
        isOpen={showToggleConfirm}
        onClose={() => { setShowToggleConfirm(false); setTargetUser(null) }}
        title={targetUser?.actif ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'}
        subtitle={targetUser ? `${targetUser.prenom} ${targetUser.nom} — ${targetUser.matricule}` : ''}
        size="sm"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setShowToggleConfirm(false); setTargetUser(null) }}>Annuler</button>
            <button type="button"
              className={clsx('text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all', targetUser?.actif ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white')}
              onClick={handleToggle} disabled={saving}>
              {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              {targetUser?.actif ? <><UserX size={12} /> Désactiver</> : <><UserCheck size={12} /> Activer</>}
            </button>
          </>
        }
      >
        <div className={clsx('p-4 rounded-lg border flex items-start gap-3 text-sm',
          targetUser?.actif ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-green-500/10 border-green-500/20 text-green-300')}>
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          {targetUser?.actif
            ? 'Cet utilisateur ne pourra plus se connecter au système. Cette action peut être annulée à tout moment.'
            : 'Cet utilisateur pourra de nouveau accéder au système selon son rôle.'}
        </div>
      </Modal>

    </div>
  )
}
