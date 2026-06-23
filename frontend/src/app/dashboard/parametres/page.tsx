'use client'

import { useState } from 'react'
import { Settings, Bell, Globe, Moon, Monitor, Palette, Save, CheckCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import { clsx } from 'clsx'

interface Prefs {
  langue: string
  theme: string
  notifSon: boolean
  notifEmail: boolean
  notifAlertes: boolean
  notifSysteme: boolean
  densiteInterface: string
  fuseau: string
}

const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    onClick={() => onChange(!value)}
    className={clsx(
      'relative inline-flex h-5 w-9 items-center rounded-full transition-all',
      value ? 'bg-green-600' : 'bg-[#1e321e]'
    )}
  >
    <span className={clsx('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', value ? 'translate-x-4' : 'translate-x-1')} />
  </button>
)

const SectionCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5 space-y-4">
    <div className="flex items-center gap-2">
      <span className="text-green-500">{icon}</span>
      <h3 className="text-sm font-semibold text-[#e8f0e8]">{title}</h3>
    </div>
    {children}
  </div>
)

const Row = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-xs text-[#e8f0e8]">{label}</div>
      {description && <div className="text-[10px] text-[#5a705a] mt-0.5">{description}</div>}
    </div>
    {children}
  </div>
)

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-3 py-1.5 text-xs text-[#e8f0e8] focus:outline-none focus:border-green-500/50 transition-all"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

export default function ParametresPage() {
  const [prefs, setPrefs] = useState<Prefs>({
    langue: 'fr',
    theme: 'dark',
    notifSon: true,
    notifEmail: false,
    notifAlertes: true,
    notifSysteme: true,
    densiteInterface: 'normale',
    fuseau: 'Africa/Kinshasa',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof Prefs>(key: K, val: Prefs[K]) =>
    setPrefs(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#050d05]">
      <Header title="Paramètres" subtitle="Préférences d'affichage et de notifications" />

      <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">

        {/* Langue & Région */}
        <SectionCard icon={<Globe size={16} />} title="Langue & Région">
          <Row label="Langue de l'interface" description="Langue d'affichage des menus et messages">
            <Select
              value={prefs.langue}
              onChange={v => set('langue', v)}
              options={[
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' },
                { value: 'ln', label: 'Lingala' },
                { value: 'sw', label: 'Swahili' },
              ]}
            />
          </Row>
          <div className="w-full h-px bg-[#1e321e]" />
          <Row label="Fuseau horaire" description="Référence pour les horodatages">
            <Select
              value={prefs.fuseau}
              onChange={v => set('fuseau', v)}
              options={[
                { value: 'Africa/Kinshasa', label: 'Kinshasa (UTC+1)' },
                { value: 'Africa/Lubumbashi', label: 'Lubumbashi (UTC+2)' },
                { value: 'UTC', label: 'UTC' },
              ]}
            />
          </Row>
        </SectionCard>

        {/* Apparence */}
        <SectionCard icon={<Palette size={16} />} title="Apparence">
          <Row label="Thème" description="Couleur de l'interface">
            <div className="flex gap-2">
              {[
                { value: 'dark', label: 'Sombre', icon: <Moon size={12} /> },
                { value: 'system', label: 'Système', icon: <Monitor size={12} /> },
              ].map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('theme', t.value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all',
                    prefs.theme === t.value
                      ? 'bg-green-600/20 border-green-500/40 text-green-400'
                      : 'bg-[#0f1a0f] border-[#1e321e] text-[#5a705a] hover:text-[#8fa88f]'
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </Row>
          <div className="w-full h-px bg-[#1e321e]" />
          <Row label="Densité de l'interface" description="Espacement des éléments">
            <Select
              value={prefs.densiteInterface}
              onChange={v => set('densiteInterface', v)}
              options={[
                { value: 'compacte', label: 'Compacte' },
                { value: 'normale', label: 'Normale' },
                { value: 'spacieuse', label: 'Spacieuse' },
              ]}
            />
          </Row>
        </SectionCard>

        {/* Notifications */}
        <SectionCard icon={<Bell size={16} />} title="Notifications">
          {[
            { key: 'notifAlertes' as const, label: 'Alertes opérationnelles', description: 'Alertes critiques et de sécurité' },
            { key: 'notifSysteme' as const, label: 'Notifications système', description: "Messages d'état et maintenance" },
            { key: 'notifSon' as const, label: 'Sons de notification', description: 'Signal sonore pour les nouvelles alertes' },
            { key: 'notifEmail' as const, label: 'Notifications par email', description: 'Résumé quotidien sur votre email enregistré' },
          ].map((item, i, arr) => (
            <div key={item.key}>
              <Row label={item.label} description={item.description}>
                <Toggle value={prefs[item.key]} onChange={v => set(item.key, v)} />
              </Row>
              {i < arr.length - 1 && <div className="w-full h-px bg-[#1e321e] mt-4" />}
            </div>
          ))}
        </SectionCard>

        {/* Bouton Enregistrer */}
        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle size={13} />
              Préférences enregistrées
            </div>
          )}
          {!saved && <div />}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-[#1e321e] disabled:text-[#5a705a] text-white text-sm font-medium rounded-lg transition-all"
          >
            <Save size={14} />
            {saving ? 'Enregistrement…' : 'Enregistrer les préférences'}
          </button>
        </div>

        {/* Info */}
        <div className="bg-[#0a110a] border border-[#1e321e] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={16} className="text-green-500" />
            <h3 className="text-sm font-semibold text-[#e8f0e8]">À propos du système</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Application', value: 'MILSYS RDC' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Organisation', value: 'FARDC — ERP Militaire' },
              { label: 'Classification', value: 'CONFIDENTIEL DÉFENSE' },
              { label: 'Environnement', value: 'Production' },
              { label: 'Dernier déploiement', value: '2024' },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-lg bg-[#0f1a0f] border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider">{item.label}</div>
                <div className="text-[#e8f0e8] mt-0.5 font-mono text-[11px]">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
