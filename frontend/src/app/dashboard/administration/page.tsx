'use client'

import { useState, useEffect } from 'react'
import { Settings, Users, Shield, Database, Lock, Activity, Plus, Edit2, Key, Server } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import administrationService from '@/services/administration.service'
import type { AuthUser } from '@/context/AuthContext'

const roleLabels: Record<string, string> = {
  souverain: 'Souverain',
  super_admin: 'Super Admin',
  admin_national: 'Admin National',
  admin_provincial: 'Admin Provincial',
  admin_territorial: 'Admin Territorial',
  admin_sectoriel: 'Admin Sectoriel',
  officier_commandant: 'Officier Commandant',
  utilisateur_operationnel: 'Utilisateur Opérationnel',
}

const systemStatus = [
  { service: 'API Backend', statut: 'operationnel', uptime: '99.98%', version: 'v2.4.1' },
  { service: 'Base de données PostgreSQL', statut: 'operationnel', uptime: '99.99%', version: 'v15.4' },
  { service: 'Redis Cache', statut: 'operationnel', uptime: '100%', version: 'v7.2' },
  { service: 'Serveur GPS/Tracking', statut: 'operationnel', uptime: '99.95%', version: 'v1.3' },
  { service: 'Module Messagerie', statut: 'operationnel', uptime: '99.97%', version: 'v2.1' },
  { service: 'Elasticsearch', statut: 'maintenance', uptime: '98.5%', version: 'v8.10' },
]

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<'utilisateurs' | 'roles' | 'systeme' | 'securite'>('utilisateurs')
  const [utilisateurs, setUtilisateurs] = useState<AuthUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    administrationService.getAllUsers()
      .then(r => setUtilisateurs((r.data as AuthUser[]) ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Header title="Administration système" subtitle="Gestion des accès, rôles et configuration MILSYS RDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Utilisateurs actifs" value={isLoading ? '…' : utilisateurs.filter(u => u.actif).length} icon={<Users size={16} />} color="green" size="sm" />
          <StatCard title="Services en ligne" value={systemStatus.filter(s => s.statut === 'operationnel').length} icon={<Server size={16} />} color="blue" size="sm" />
          <StatCard title="Rôles configurés" value={8} icon={<Shield size={16} />} color="yellow" size="sm" />
          <StatCard title="Tentatives bloquées" value={1} icon={<Lock size={16} />} color="red" size="sm" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#0f1a0f] border border-[#1e321e] rounded-xl p-1 w-fit flex-wrap">
          {['utilisateurs', 'roles', 'systeme', 'securite'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${activeTab === tab ? 'bg-green-600 text-white' : 'text-[#5a705a] hover:text-[#e8f0e8]'}`}
            >
              {tab === 'utilisateurs' ? 'Utilisateurs' : tab === 'roles' ? 'Rôles & Permissions' : tab === 'systeme' ? 'État du système' : 'Sécurité'}
            </button>
          ))}
        </div>

        {/* Utilisateurs */}
        {activeTab === 'utilisateurs' && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-green-400" />
                <span className="text-sm font-semibold text-[#e8f0e8]">Gestion des utilisateurs</span>
              </div>
              <button className="btn-primary text-xs px-3 py-1.5">
                <Plus size={13} />
                Nouvel utilisateur
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full mil-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Province</th>
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
                          <div className="text-[10px] text-[#5a705a]">{u.grade ?? '—'}</div>
                        </div>
                      </td>
                      <td>
                        <span className="text-xs text-[#8fa88f]">{roleLabels[u.role] ?? u.role}</span>
                      </td>
                      <td><span className="text-xs text-[#8fa88f]">{u.unite?.nom ?? '—'}</span></td>
                      <td><span className="text-[11px] font-mono text-[#5a705a]">{u.dernierLogin ? new Date(u.dernierLogin).toLocaleString('fr-FR') : '—'}</span></td>
                      <td>
                        <Badge label={u.actif ? 'Actif' : 'Inactif'} variant={u.actif ? 'actif' : 'retraite'} dot />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" title="Modifier" className="p-1.5 rounded-lg text-[#5a705a] hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Edit2 size={13} /></button>
                          <button type="button" title="Réinitialiser mot de passe" className="p-1.5 rounded-lg text-[#5a705a] hover:text-yellow-400 hover:bg-yellow-500/10 transition-all"><Key size={13} /></button>
                          {u.actif && (
                            <button type="button" title="Désactiver" className="p-1.5 rounded-lg text-[#5a705a] hover:text-red-400 hover:bg-red-500/10 transition-all"><Lock size={13} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Roles */}
        {activeTab === 'roles' && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center gap-2">
              <Shield size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Rôles et niveaux d'accès</span>
            </div>
            <div className="p-4 space-y-2">
              {[
                { niveau: 1, role: 'Souverain', acteurs: 'Présidence de la République', droits: 'Lecture stratégique uniquement. Tableaux de bord nationaux.', color: 'border-l-yellow-500' },
                { niveau: 2, role: 'Super Administrateur', acteurs: 'Ministère de la Défense', droits: 'Administration complète. Paramétrage global. Tous modules.', color: 'border-l-red-500' },
                { niveau: 3, role: 'Admin National', acteurs: 'État-Major Général', droits: 'Gestion opérations nationales. Supervision tous niveaux.', color: 'border-l-orange-500' },
                { niveau: 4, role: 'Admin Provincial', acteurs: 'Commandants de Région', droits: 'Gestion régionale. Personnel, missions, ressources.', color: 'border-l-blue-500' },
                { niveau: 5, role: 'Admin Territorial', acteurs: 'Administration Territoriale', droits: 'Gestion territoire/brigade. Contrôle provincial.', color: 'border-l-purple-500' },
                { niveau: 6, role: 'Admin Sectoriel', acteurs: 'Administration Sectorielle', droits: 'Gestion quotidienne secteur. Présences, équipements.', color: 'border-l-green-500' },
                { niveau: 7, role: 'Officier Commandant', acteurs: 'Commandants d\'Unités', droits: 'Gestion unité. Validation demandes. Rapports.', color: 'border-l-teal-500' },
                { niveau: 8, role: 'Utilisateur Opérationnel', acteurs: 'Officiers / Sous-officiers', droits: 'Consultation données personnelles. Messagerie. Demandes.', color: 'border-l-gray-500' },
              ].map(r => (
                <div key={r.niveau} className={`border border-l-4 ${r.color} border-[#1e321e] rounded-xl px-4 py-3 bg-[#0f1a0f]`}>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#1a261a] border border-[#1e321e] flex items-center justify-center text-xs font-bold text-green-400 flex-shrink-0">
                      {r.niveau}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-[#e8f0e8]">{r.role}</span>
                      </div>
                      <div className="text-[10px] text-[#5a705a] mb-0.5">Acteurs : {r.acteurs}</div>
                      <div className="text-[10px] text-[#8fa88f]">{r.droits}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System status */}
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
                    <div className={`w-2 h-2 rounded-full ${s.statut === 'operationnel' ? 'bg-green-400 status-live' : 'bg-yellow-400'}`} />
                    <div>
                      <div className="text-xs font-medium text-[#e8f0e8]">{s.service}</div>
                      <div className="text-[10px] text-[#5a705a]">{s.version}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-[#5a705a]">Disponibilité</div>
                      <div className={`text-xs font-bold ${s.statut === 'operationnel' ? 'text-green-400' : 'text-yellow-400'}`}>{s.uptime}</div>
                    </div>
                    <Badge
                      label={s.statut === 'operationnel' ? 'Opérationnel' : 'Maintenance'}
                      variant={s.statut === 'operationnel' ? 'actif' : 'en_attente'}
                      dot
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'securite' && (
          <div className="space-y-4">
            <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8] mb-3 flex items-center gap-2">
                <Lock size={14} className="text-green-400" />
                Configuration de sécurité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Authentification MFA', valeur: 'Obligatoire', statut: 'actif' },
                  { label: 'Chiffrement AES-256', valeur: 'Activé', statut: 'actif' },
                  { label: 'TLS 1.3', valeur: 'Activé', statut: 'actif' },
                  { label: 'HSM (Hardware Security Module)', valeur: 'Connecté', statut: 'actif' },
                  { label: 'WAF (Web Application Firewall)', valeur: 'Actif', statut: 'actif' },
                  { label: 'IDS/IPS (Détection intrusion)', valeur: 'Actif', statut: 'actif' },
                  { label: 'Sauvegarde automatique', valeur: 'Quotidienne 02h00', statut: 'actif' },
                  { label: 'Rotation mots de passe', valeur: 'Tous les 90 jours', statut: 'actif' },
                  { label: 'Verrouillage après échecs', valeur: '5 tentatives', statut: 'actif' },
                  { label: 'Conservation journaux', valeur: '10 ans minimum', statut: 'actif' },
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
    </div>
  )
}
