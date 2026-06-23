'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Heart, MapPin, Shield, BookOpen, GraduationCap, Zap,
  Package, Target, Scale, DollarSign, FileText, Bot,
  Camera, Fingerprint, ChevronLeft, ChevronRight, Save, Printer,
  Download, QrCode, CreditCard, CheckCircle, Plus,
  Trash2, Upload, RefreshCw, Eye, Lock,
  Users, Briefcase, Phone,
  Stethoscope, Sword
} from 'lucide-react'
import Header from '@/components/layout/Header'
import { clsx } from 'clsx'
import { useAddMilitaire } from '@/context/MilitaireContext'
import type { Militaire, StatutMilitaire } from '@/types'
import gradesService, { type Grade } from '@/services/grades.service'
import unitesService, { type Unite } from '@/services/unites.service'
import basesService, { type BaseMilitaire } from '@/services/bases.service'

// ── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  // 1. Identité
  matricule: string; nin: string; nom: string; postnom: string; prenom: string
  sexe: string; dateNaissance: string; age: number; lieuNaissance: string
  nationalite: string; groupeSanguin: string
  photoUploaded: boolean; signatureUploaded: boolean; empreinteUploaded: boolean; irisUploaded: boolean
  // 2. Famille
  etatCivil: string; nomConjoint: string; nombreEnfants: number
  urgenceNom: string; urgenceLien: string; urgenceTel: string; urgenceAdresse: string
  // 3. Coordonnées
  pays: string; province: string; ville: string; commune: string
  quartier: string; avenue: string; numeroresidence: string
  telPrincipal: string; telSecondaire: string; emailPro: string; emailPerso: string
  gpsLat: string; gpsLng: string
  // 4. Militaire
  branche: string; forceArmee: string; regionMilitaire: string; zoneOperationnelle: string
  baseMilitaire: string; unite: string; bataillon: string; compagnie: string; section: string; escouade: string
  grade: string; dateGrade: string; gradePrecedent: string; datePromotion: string; statut: string
  // 5. Recrutement
  typeRecrutement: string; dateRecrutement: string; centreRecrutement: string
  promotion: string; numeroDossier: string; autoriteValidation: string
  // 6. Académique
  niveauEtude: string; diplomes: Array<{ nom: string; etablissement: string; annee: string }>
  langues: string[]
  // 7. Formations militaires
  formations: Array<{ nom: string; centre: string; dateDebut: string; dateFin: string; resultat: string }>
  specialisations: string[]
  // 8. Aptitudes
  competences: string[]
  certifications: Array<{ nom: string; date: string; expiration: string }>
  // 9. Médical
  taille: string; poids: string; allergies: string; antecedents: string
  vaccinations: Array<{ nom: string; date: string }>
  aptitudeMedicale: string; restrictions: string
  // 10. Équipements
  armePrincipale: string; armeNumSerie: string; armeSecondaire: string
  uniforme: boolean; giletPareBalle: boolean; casque: boolean; radio: boolean; vehiculeAttribue: string
  // 11-12-13 Opérations / Disciplinaire / Finances
  niveauConfidentialite: string; notesCreation: string
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'identite',     label: '1. Identité',         icon: User },
  { id: 'famille',      label: '2. Famille',          icon: Heart },
  { id: 'coordonnees',  label: '3. Coordonnées',      icon: MapPin },
  { id: 'militaire',    label: '4. Affectation',      icon: Shield },
  { id: 'recrutement',  label: '5. Recrutement',      icon: Briefcase },
  { id: 'academique',   label: '6. Formation acad.',  icon: GraduationCap },
  { id: 'formations',   label: '7. Form. mil.',       icon: BookOpen },
  { id: 'aptitudes',    label: '8. Aptitudes',        icon: Zap },
  { id: 'medical',      label: '9. Médical',          icon: Stethoscope },
  { id: 'equipements',  label: '10. Équipements',     icon: Package },
  { id: 'operations',   label: '11. Opérations',      icon: Target },
  { id: 'disciplinaire',label: '12. Disciplinaire',   icon: Scale },
  { id: 'finances',     label: '13. Finances',        icon: DollarSign },
  { id: 'documents',    label: '14. Documents',       icon: FileText },
  { id: 'ia',           label: '15. IA & Audit',      icon: Bot },
]

const GROUPS_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const SPECIALISATIONS = ['Infanterie', 'Artillerie', 'Génie militaire', 'Transmission', 'Logistique', 'Santé militaire', 'Renseignement', 'Cyberdéfense', 'Aviation', 'Marine', 'Forces spéciales']
const COMPETENCES = ['Tir de précision', 'Conduite militaire', 'Pilotage drone', 'Informatique / IT', 'Cyberdéfense', 'Communication radio', 'Maintenance mécanique', 'Secourisme de combat', 'Navigation terrain', 'Langue des signes']
const LANGUES = ['Français', 'Anglais', 'Swahili', 'Lingala', 'Kikongo', 'Tshiluba', 'Arabe', 'Portugais']

function genMatricule() {
  const year = new Date().getFullYear()
  const seq = Math.floor(10000 + Math.random() * 89999)
  return `FARDC-${year}-${seq}`
}

function calcAge(dob: string): number {
  if (!dob) return 0
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

const EMPTY: FormData = {
  matricule: genMatricule(), nin: '', nom: '', postnom: '', prenom: '',
  sexe: 'M', dateNaissance: '', age: 0, lieuNaissance: '', nationalite: 'Congolaise', groupeSanguin: 'O+',
  photoUploaded: false, signatureUploaded: false, empreinteUploaded: false, irisUploaded: false,
  etatCivil: 'celibataire', nomConjoint: '', nombreEnfants: 0,
  urgenceNom: '', urgenceLien: '', urgenceTel: '', urgenceAdresse: '',
  pays: 'RD Congo', province: '', ville: '', commune: '', quartier: '', avenue: '', numeroresidence: '',
  telPrincipal: '', telSecondaire: '', emailPro: '', emailPerso: '',
  gpsLat: '', gpsLng: '',
  branche: 'Armée de terre', forceArmee: 'FARDC', regionMilitaire: '', zoneOperationnelle: '',
  baseMilitaire: '', unite: '', bataillon: '', compagnie: '', section: '', escouade: '',
  grade: '', dateGrade: '', gradePrecedent: '', datePromotion: '', statut: 'actif',
  typeRecrutement: 'conscription', dateRecrutement: '', centreRecrutement: '', promotion: '', numeroDossier: '', autoriteValidation: '',
  niveauEtude: 'secondaire',
  diplomes: [{ nom: '', etablissement: '', annee: '' }],
  langues: ['Français'],
  formations: [{ nom: '', centre: '', dateDebut: '', dateFin: '', resultat: '' }],
  specialisations: [],
  competences: [],
  certifications: [{ nom: '', date: '', expiration: '' }],
  taille: '', poids: '', allergies: '', antecedents: '',
  vaccinations: [{ nom: 'Fièvre jaune', date: '' }, { nom: 'COVID-19', date: '' }],
  aptitudeMedicale: 'apte', restrictions: '',
  armePrincipale: '', armeNumSerie: '', armeSecondaire: '',
  uniforme: true, giletPareBalle: false, casque: false, radio: false, vehiculeAttribue: '',
  niveauConfidentialite: 'restreint', notesCreation: '',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-[#5a705a] uppercase tracking-wider mb-1.5 font-medium">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 mb-5 border-b border-[#1e321e]">
      <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-green-400" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#e8f0e8]">{title}</h3>
        {subtitle && <p className="text-[11px] text-[#5a705a] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function BiometricBox({ label, icon: Icon, done, onSimulate }: { label: string; icon: any; done: boolean; onSimulate: () => void }) {
  return (
    <button
      type="button"
      onClick={onSimulate}
      className={clsx(
        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
        done ? 'border-green-500/40 bg-green-500/10' : 'border-[#1e321e] bg-[#0a110a] hover:border-green-500/30 border-dashed'
      )}
    >
      {done ? (
        <CheckCircle size={24} className="text-green-400" />
      ) : (
        <Icon size={24} className="text-[#5a705a]" />
      )}
      <span className={clsx('text-[10px] font-medium text-center', done ? 'text-green-400' : 'text-[#5a705a]')}>
        {done ? '✓ Capturé' : label}
      </span>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NouveauMilitairePage() {
  const router = useRouter()
  const addMilitaire = useAddMilitaire()
  const [tab, setTab] = useState('identite')
  const [form, setForm] = useState<FormData>(EMPTY)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [gradesList, setGradesList] = useState<Grade[]>([])
  const [unitesList, setUnitesList] = useState<Unite[]>([])
  const [basesList, setBasesList] = useState<BaseMilitaire[]>([])

  useEffect(() => {
    gradesService.getAll({ limit: 100, sort: 'niveauHierarchique' }).then(r => setGradesList((r.data as Grade[]) ?? [])).catch(() => {})
    unitesService.getAll({ limit: 200 }).then(r => setUnitesList((r.data as Unite[]) ?? [])).catch(() => {})
    basesService.getAll({ limit: 100 }).then(r => setBasesList((r.data as BaseMilitaire[]) ?? [])).catch(() => {})
  }, [])

  const tabIdx = TABS.findIndex(t => t.id === tab)

  // Auto-calculate age
  useEffect(() => {
    if (form.dateNaissance) {
      setForm(f => ({ ...f, age: calcAge(f.dateNaissance) }))
    }
  }, [form.dateNaissance])

  const set = (key: keyof FormData, val: any) => setForm(f => ({ ...f, [key]: val }))

  const toggleArr = (key: 'langues' | 'specialisations' | 'competences', val: string) => {
    setForm(f => {
      const arr = f[key] as string[]
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] }
    })
  }

  const completedTabs = TABS.filter(t => {
    if (t.id === 'identite') return form.nom && form.prenom && form.dateNaissance && form.grade
    if (t.id === 'famille') return form.urgenceNom && form.urgenceTel
    if (t.id === 'coordonnees') return form.province && form.ville && form.telPrincipal
    if (t.id === 'militaire') return form.unite && form.grade && form.statut
    if (t.id === 'medical') return form.aptitudeMedicale
    return false
  }).length

  const progress = Math.round((completedTabs / 5) * 100)

  const handleSave = () => {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (!form.nom) errs.nom = 'Obligatoire'
    if (!form.prenom) errs.prenom = 'Obligatoire'
    if (!form.dateNaissance) errs.dateNaissance = 'Obligatoire'
    if (!form.grade) errs.grade = 'Obligatoire'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTab('identite')
      return
    }

    // Map form → Militaire and persist via context (localStorage)
    const aptMap: Record<string, Militaire['aptitudePhysique']> = {
      apte: 'apte', apte_restriction: 'apte_restriction',
    }
    const militaire: Militaire = {
      id: `M-${Date.now()}`,
      matricule: form.matricule,
      nom: form.nom.toUpperCase(),
      postnom: form.postnom.toUpperCase(),
      prenom: form.prenom,
      dateNaissance: form.dateNaissance,
      sexe: form.sexe as 'M' | 'F',
      nationalite: form.nationalite,
      provinceOrigine: form.province || form.ville,
      adresse: [form.avenue, form.commune, form.ville].filter(Boolean).join(', ') || form.ville,
      telephone: form.telPrincipal,
      groupeSanguin: form.groupeSanguin,
      aptitudePhysique: aptMap[form.aptitudeMedicale] ?? 'apte',
      grade: form.grade,
      corps: form.specialisations[0] || form.branche,
      arme: form.specialisations[0] || form.branche,
      unite: form.unite || form.regionMilitaire,
      provinceAffectation: form.province || form.ville,
      dateIntegration: form.dateRecrutement || new Date().toISOString().slice(0, 10),
      statut: form.statut as StatutMilitaire,
      allergies: form.allergies || undefined,
      numeroCarteMillitaire: `CM-${form.matricule.replace('FARDC-', '')}`,
    }

    addMilitaire(militaire)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.push('/dashboard/personnel') }, 2000)
  }

  const sectionNavClass = (id: string) => clsx(
    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-xs',
    tab === id
      ? 'bg-green-600 text-white font-semibold'
      : 'text-[#5a705a] hover:text-[#e8f0e8] hover:bg-[#1e321e]'
  )

  // ── Render sections ──────────────────────────────────────────────────────────

  const renderIdentite = () => (
    <div className="space-y-6">
      <SectionTitle icon={User} title="Identité du militaire" subtitle="Informations civiles et biométriques officielles" />

      {/* Matricule + NIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Numéro matricule" required>
          <div className="flex gap-2">
            <input value={form.matricule} readOnly className="mil-input flex-1 text-xs font-mono text-green-400 bg-green-500/5" />
            <button type="button" onClick={() => set('matricule', genMatricule())} className="p-2 border border-[#1e321e] rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all" title="Régénérer">
              <RefreshCw size={14} />
            </button>
          </div>
          <p className="text-[10px] text-[#5a705a] mt-1">Généré automatiquement — modifiable par l&apos;admin</p>
        </Field>
        <Field label="Numéro d'identification national (NIN)">
          <input value={form.nin} onChange={e => set('nin', e.target.value)} className="mil-input w-full text-xs font-mono" placeholder="NIN-000000000" />
        </Field>
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Nom" required>
          <input value={form.nom} onChange={e => set('nom', e.target.value.toUpperCase())}
            className={clsx('mil-input w-full text-xs uppercase', errors.nom && 'border-red-500')}
            placeholder="NOM DE FAMILLE"
          />
          {errors.nom && <p className="text-[10px] text-red-400 mt-1">{errors.nom}</p>}
        </Field>
        <Field label="Post-nom">
          <input value={form.postnom} onChange={e => set('postnom', e.target.value.toUpperCase())} className="mil-input w-full text-xs uppercase" placeholder="POST-NOM" />
        </Field>
        <Field label="Prénom" required>
          <input value={form.prenom} onChange={e => set('prenom', e.target.value)}
            className={clsx('mil-input w-full text-xs', errors.prenom && 'border-red-500')}
            placeholder="Prénom(s)"
          />
          {errors.prenom && <p className="text-[10px] text-red-400 mt-1">{errors.prenom}</p>}
        </Field>
      </div>

      {/* Personal info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Sexe" required>
          <select value={form.sexe} onChange={e => set('sexe', e.target.value)} className="mil-select w-full text-xs">
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </Field>
        <Field label="Date de naissance" required>
          <input type="date" value={form.dateNaissance} onChange={e => set('dateNaissance', e.target.value)}
            className={clsx('mil-input w-full text-xs', errors.dateNaissance && 'border-red-500')}
          />
          {errors.dateNaissance && <p className="text-[10px] text-red-400 mt-1">{errors.dateNaissance}</p>}
        </Field>
        <Field label="Âge (auto)">
          <div className="mil-input flex items-center text-xs font-bold text-green-400">
            {form.age > 0 ? `${form.age} ans` : '—'}
          </div>
        </Field>
        <Field label="Nationalité">
          <input value={form.nationalite} onChange={e => set('nationalite', e.target.value)} className="mil-input w-full text-xs" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Lieu de naissance">
          <input value={form.lieuNaissance} onChange={e => set('lieuNaissance', e.target.value)} className="mil-input w-full text-xs" placeholder="Ville / Territoire" />
        </Field>
        <Field label="Groupe sanguin" required>
          <select value={form.groupeSanguin} onChange={e => set('groupeSanguin', e.target.value)} className="mil-select w-full text-xs">
            {GROUPS_SANGUINS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Niveau de confidentialité">
          <select value={form.niveauConfidentialite} onChange={e => set('niveauConfidentialite', e.target.value)} className="mil-select w-full text-xs">
            <option value="public">Public</option>
            <option value="restreint">Restreint</option>
            <option value="confidentiel">Confidentiel</option>
            <option value="secret">Secret défense</option>
          </select>
        </Field>
      </div>

      {/* Biometrics */}
      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
          <Fingerprint size={12} /> Biométrie &amp; Identifiants visuels
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <BiometricBox label="Photo officielle" icon={Camera} done={form.photoUploaded} onSimulate={() => set('photoUploaded', !form.photoUploaded)} />
          <BiometricBox label="Signature numérique" icon={CreditCard} done={form.signatureUploaded} onSimulate={() => set('signatureUploaded', !form.signatureUploaded)} />
          <BiometricBox label="Empreintes digitales" icon={Fingerprint} done={form.empreinteUploaded} onSimulate={() => set('empreinteUploaded', !form.empreinteUploaded)} />
          <BiometricBox label="Scan iris (optionnel)" icon={Eye} done={form.irisUploaded} onSimulate={() => set('irisUploaded', !form.irisUploaded)} />
        </div>
        <p className="text-[10px] text-[#5a705a] mt-2 flex items-center gap-1">
          <Lock size={9} /> Les données biométriques sont chiffrées AES-256 et stockées de manière isolée.
        </p>
      </div>
    </div>
  )

  const renderFamille = () => (
    <div className="space-y-6">
      <SectionTitle icon={Heart} title="Informations familiales" subtitle="Situation maritale, ayants droit et personnes à contacter" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="État civil">
          <select value={form.etatCivil} onChange={e => set('etatCivil', e.target.value)} className="mil-select w-full text-xs">
            <option value="celibataire">Célibataire</option>
            <option value="marie">Marié(e)</option>
            <option value="divorce">Divorcé(e)</option>
            <option value="veuf">Veuf/Veuve</option>
          </select>
        </Field>
        {form.etatCivil === 'marie' && (
          <Field label="Nom du / de la conjoint(e)">
            <input value={form.nomConjoint} onChange={e => set('nomConjoint', e.target.value)} className="mil-input w-full text-xs" />
          </Field>
        )}
        <Field label="Nombre d'enfants">
          <input type="number" min={0} value={form.nombreEnfants} onChange={e => set('nombreEnfants', +e.target.value)} className="mil-input w-full text-xs" />
        </Field>
      </div>

      {/* Emergency contact */}
      <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-[11px] text-[#8fa88f] font-semibold">
          <Phone size={12} className="text-red-400" />
          Contact d&apos;urgence <span className="text-red-400 text-[10px] ml-1">— obligatoire</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Nom complet" required>
            <input value={form.urgenceNom} onChange={e => set('urgenceNom', e.target.value)} className="mil-input w-full text-xs" placeholder="Nom et prénom" />
          </Field>
          <Field label="Lien de parenté">
            <select value={form.urgenceLien} onChange={e => set('urgenceLien', e.target.value)} className="mil-select w-full text-xs">
              <option value="">Sélectionner...</option>
              <option value="conjoint">Conjoint(e)</option>
              <option value="pere">Père</option>
              <option value="mere">Mère</option>
              <option value="frere">Frère / Sœur</option>
              <option value="enfant">Enfant</option>
              <option value="ami">Ami proche</option>
            </select>
          </Field>
          <Field label="Téléphone d'urgence" required>
            <input value={form.urgenceTel} onChange={e => set('urgenceTel', e.target.value)} className="mil-input w-full text-xs" placeholder="+243..." />
          </Field>
          <Field label="Adresse du domicile familial">
            <input value={form.urgenceAdresse} onChange={e => set('urgenceAdresse', e.target.value)} className="mil-input w-full text-xs" placeholder="Adresse..." />
          </Field>
        </div>
      </div>

      {/* Ayants droit */}
      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
          <Users size={12} /> Informations des ayants droit (bénéficiaires)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Conjoint(e)', 'Parent / Tuteur', 'Enfant 1'].map((type, i) => (
            <div key={i} className="bg-[#0a110a] border border-dashed border-[#1e321e] rounded-xl p-3 space-y-2">
              <div className="text-[10px] font-semibold text-[#8fa88f]">{type}</div>
              <input className="mil-input w-full text-xs" placeholder="Nom complet..." />
              <input className="mil-input w-full text-xs" placeholder="Téléphone..." />
              <input className="mil-input w-full text-xs" placeholder="% bénéfice..." />
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors">
          <Plus size={12} /> Ajouter un ayant droit
        </button>
      </div>
    </div>
  )

  const renderCoordonnes = () => (
    <div className="space-y-6">
      <SectionTitle icon={MapPin} title="Coordonnées personnelles" subtitle="Adresse du domicile, contacts et géolocalisation" />

      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Adresse physique</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Pays">
            <input value={form.pays} onChange={e => set('pays', e.target.value)} className="mil-input w-full text-xs" />
          </Field>
          <Field label="Province" required>
            <select value={form.province} onChange={e => set('province', e.target.value)} className="mil-select w-full text-xs">
              <option value="">Sélectionner...</option>
              {['Kinshasa', 'Nord-Kivu', 'Sud-Kivu', 'Katanga', 'Orientale', 'Équateur', 'Maniema', 'Kasaï', 'Kasaï Oriental', 'Lomami', 'Kongo-Central', 'Ituri', 'Nord-Ubangi', 'Haut-Katanga', 'Lualaba'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Ville" required>
            <input value={form.ville} onChange={e => set('ville', e.target.value)} className="mil-input w-full text-xs" placeholder="Ville / Territoire" />
          </Field>
          <Field label="Commune">
            <input value={form.commune} onChange={e => set('commune', e.target.value)} className="mil-input w-full text-xs" />
          </Field>
          <Field label="Quartier">
            <input value={form.quartier} onChange={e => set('quartier', e.target.value)} className="mil-input w-full text-xs" />
          </Field>
          <Field label="Avenue / Rue">
            <input value={form.avenue} onChange={e => set('avenue', e.target.value)} className="mil-input w-full text-xs" />
          </Field>
          <Field label="N° de résidence">
            <input value={form.numeroresidence} onChange={e => set('numeroresidence', e.target.value)} className="mil-input w-full text-xs" />
          </Field>
        </div>
      </div>

      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Contacts</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Téléphone principal" required>
            <input value={form.telPrincipal} onChange={e => set('telPrincipal', e.target.value)} className="mil-input w-full text-xs" placeholder="+243 8..." />
          </Field>
          <Field label="Téléphone secondaire">
            <input value={form.telSecondaire} onChange={e => set('telSecondaire', e.target.value)} className="mil-input w-full text-xs" placeholder="+243 8..." />
          </Field>
          <Field label="Email professionnel">
            <input type="email" value={form.emailPro} onChange={e => set('emailPro', e.target.value)} className="mil-input w-full text-xs" placeholder="@fardc.cd" />
          </Field>
          <Field label="Email personnel">
            <input type="email" value={form.emailPerso} onChange={e => set('emailPerso', e.target.value)} className="mil-input w-full text-xs" placeholder="@gmail.com" />
          </Field>
        </div>
      </div>

      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium flex items-center gap-2">
          <MapPin size={11} /> Géolocalisation GPS
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude GPS">
            <input value={form.gpsLat} onChange={e => set('gpsLat', e.target.value)} className="mil-input w-full text-xs font-mono" placeholder="-4.324567" />
          </Field>
          <Field label="Longitude GPS">
            <input value={form.gpsLng} onChange={e => set('gpsLng', e.target.value)} className="mil-input w-full text-xs font-mono" placeholder="15.322456" />
          </Field>
        </div>
        <div className="mt-2 text-[10px] text-[#5a705a]">Historique des localisations consultable dans le module Géolocalisation GPS.</div>
      </div>
    </div>
  )

  const renderMilitaire = () => (
    <div className="space-y-6">
      <SectionTitle icon={Shield} title="Affectation & Grade militaire" subtitle="Unité, grade, statut et structure hiérarchique" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Branche militaire">
          <select value={form.branche} onChange={e => set('branche', e.target.value)} className="mil-select w-full text-xs">
            <option>Armée de terre</option>
            <option>Marine nationale</option>
            <option>Armée de l'air</option>
            <option>Forces spéciales</option>
            <option>Gendarmerie</option>
          </select>
        </Field>
        <Field label="Force armée">
          <input value={form.forceArmee} readOnly className="mil-input w-full text-xs font-mono text-green-400 bg-green-500/5" />
        </Field>
        <Field label="Zone & Région militaire">
          <select value={form.regionMilitaire} onChange={e => set('regionMilitaire', e.target.value)} className="mil-select w-full text-xs">
            <option value="">Sélectionner une région...</option>
            {unitesList.map(u => (
              <option key={u._id} value={u.code}>{u.code} — {u.nom}</option>
            ))}
          </select>
        </Field>
        <Field label="Base militaire">
          <select value={form.baseMilitaire} onChange={e => set('baseMilitaire', e.target.value)} className="mil-select w-full text-xs">
            <option value="">Sélectionner...</option>
            {basesList.map(b => <option key={b._id} value={b.code}>{b.nom}</option>)}
          </select>
        </Field>
        <Field label="Unité / Code unité" required>
          <select value={form.unite} onChange={e => set('unite', e.target.value)} className={clsx('mil-select w-full text-xs', errors.unite && 'border-red-500')}>
            <option value="">Sélectionner l'unité...</option>
            {unitesList.map(u => <option key={u._id} value={u.code}>{u.code} — {u.nom}</option>)}
          </select>
        </Field>
        <Field label="Zone opérationnelle">
          <input value={form.zoneOperationnelle} onChange={e => set('zoneOperationnelle', e.target.value)} className="mil-input w-full text-xs" placeholder="Ex: Zone Est" />
        </Field>
        <Field label="Bataillon">
          <input value={form.bataillon} onChange={e => set('bataillon', e.target.value)} className="mil-input w-full text-xs" placeholder="Code bataillon..." />
        </Field>
        <Field label="Compagnie">
          <input value={form.compagnie} onChange={e => set('compagnie', e.target.value)} className="mil-input w-full text-xs" placeholder="Ex: CP-1" />
        </Field>
        <Field label="Section / Escouade">
          <input value={form.section} onChange={e => set('section', e.target.value)} className="mil-input w-full text-xs" placeholder="Ex: Section 3" />
        </Field>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Grade actuel" required>
          <select value={form.grade} onChange={e => set('grade', e.target.value)}
            className={clsx('mil-select w-full text-xs', errors.grade && 'border-red-500')}>
            <option value="">Sélectionner le grade...</option>
            {gradesList.map(g => <option key={g._id} value={g.nom}>{g.abreviation} — {g.nom}</option>)}
          </select>
          {errors.grade && <p className="text-[10px] text-red-400 mt-1">{errors.grade}</p>}
        </Field>
        <Field label="Date d'obtention du grade">
          <input type="date" value={form.dateGrade} onChange={e => set('dateGrade', e.target.value)} className="mil-input w-full text-xs" />
        </Field>
        <Field label="Grade précédent">
          <select value={form.gradePrecedent} onChange={e => set('gradePrecedent', e.target.value)} className="mil-select w-full text-xs">
            <option value="">Aucun / Premier grade</option>
            {gradesList.map(g => <option key={g._id} value={g.nom}>{g.abreviation} — {g.nom}</option>)}
          </select>
        </Field>
        <Field label="Date de dernière promotion">
          <input type="date" value={form.datePromotion} onChange={e => set('datePromotion', e.target.value)} className="mil-input w-full text-xs" />
        </Field>
      </div>

      <Field label="Statut militaire" required>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { val: 'actif', label: 'En service', color: 'green' },
            { val: 'en_mission', label: 'En mission', color: 'blue' },
            { val: 'en_permission', label: 'En permission', color: 'yellow' },
            { val: 'suspendu', label: 'Suspendu', color: 'orange' },
            { val: 'en_formation', label: 'En formation', color: 'purple' },
            { val: 'retraite', label: 'En retraite', color: 'gray' },
            { val: 'decede', label: 'Décédé', color: 'red' },
            { val: 'deserteur', label: 'Déserteur', color: 'red' },
          ].map(s => (
            <button
              key={s.val}
              type="button"
              onClick={() => set('statut', s.val)}
              className={clsx('px-3 py-2 rounded-xl border text-[11px] font-medium transition-all', {
                'bg-green-600 border-green-600 text-white': form.statut === s.val,
                'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8] hover:border-[#2a3e2a]': form.statut !== s.val,
              })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )

  const renderRecrutement = () => (
    <div className="space-y-6">
      <SectionTitle icon={Briefcase} title="Informations de recrutement" subtitle="Type, date, promotion et autorité ayant validé" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Type de recrutement">
          <select value={form.typeRecrutement} onChange={e => set('typeRecrutement', e.target.value)} className="mil-select w-full text-xs">
            <option value="conscription">Conscription</option>
            <option value="engagement_volontaire">Engagement volontaire</option>
            <option value="officier_sortie_ecole">Officier sorti d'école</option>
            <option value="contrat">Contrat</option>
            <option value="integration">Intégration / Ex-combattant</option>
          </select>
        </Field>
        <Field label="Date de recrutement">
          <input type="date" value={form.dateRecrutement} onChange={e => set('dateRecrutement', e.target.value)} className="mil-input w-full text-xs" />
        </Field>
        <Field label="Centre de recrutement">
          <input value={form.centreRecrutement} onChange={e => set('centreRecrutement', e.target.value)} className="mil-input w-full text-xs" placeholder="Ville / centre de recrutement" />
        </Field>
        <Field label="Promotion / Classe">
          <input value={form.promotion} onChange={e => set('promotion', e.target.value)} className="mil-input w-full text-xs" placeholder="Ex: Promotion UMOJA 2020" />
        </Field>
        <Field label="Numéro de dossier de recrutement">
          <input value={form.numeroDossier} onChange={e => set('numeroDossier', e.target.value)} className="mil-input w-full text-xs font-mono" placeholder="DOS-RECR-..." />
        </Field>
        <Field label="Autorité ayant validé">
          <input value={form.autoriteValidation} onChange={e => set('autoriteValidation', e.target.value)} className="mil-input w-full text-xs" placeholder="Grade et nom..." />
        </Field>
      </div>
      <div className="bg-[#0a110a] border border-dashed border-[#1e321e] rounded-xl p-4">
        <div className="text-[11px] text-[#5a705a] mb-3 font-medium flex items-center gap-2"><Upload size={12} /> Documents de recrutement</div>
        {['Bulletin d\'incorporation', 'Engagement signé', 'Extrait de casier judiciaire', 'Certificat de visite médicale initiale'].map(d => (
          <div key={d} className="flex items-center justify-between py-2 border-b border-[#1e321e] last:border-0">
            <span className="text-xs text-[#8fa88f]">{d}</span>
            <button type="button" className="text-[11px] text-green-400 hover:text-green-300 flex items-center gap-1"><Upload size={11} /> Joindre</button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAcademique = () => (
    <div className="space-y-6">
      <SectionTitle icon={GraduationCap} title="Parcours académique" subtitle="Niveau d'étude, diplômes et langues parlées" />

      <Field label="Niveau d'étude le plus élevé">
        <div className="flex flex-wrap gap-2">
          {[['primaire', 'Primaire'], ['secondaire', 'Secondaire'], ['universitaire', 'Universitaire / Licence'], ['master', 'Master'], ['doctorat', 'Doctorat']].map(([v, l]) => (
            <button key={v} type="button" onClick={() => set('niveauEtude', v)}
              className={clsx('px-3 py-1.5 rounded-lg border text-xs font-medium transition-all', form.niveauEtude === v ? 'bg-green-600 border-green-600 text-white' : 'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8]')}>
              {l}
            </button>
          ))}
        </div>
      </Field>

      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Diplômes obtenus</div>
        {form.diplomes.map((d, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 mb-3 items-start">
            <Field label="Nom du diplôme">
              <input value={d.nom} onChange={e => { const arr = [...form.diplomes]; arr[i].nom = e.target.value; set('diplomes', arr) }} className="mil-input w-full text-xs" placeholder="DEES, Licence, BSc..." />
            </Field>
            <Field label="Établissement">
              <input value={d.etablissement} onChange={e => { const arr = [...form.diplomes]; arr[i].etablissement = e.target.value; set('diplomes', arr) }} className="mil-input w-full text-xs" placeholder="Université..." />
            </Field>
            <div className="flex gap-2">
              <div className="flex-1">
                <Field label="Année">
                  <input type="number" value={d.annee} onChange={e => { const arr = [...form.diplomes]; arr[i].annee = e.target.value; set('diplomes', arr) }} className="mil-input w-full text-xs" placeholder="2020" />
                </Field>
              </div>
              {i > 0 && (
                <button type="button" onClick={() => set('diplomes', form.diplomes.filter((_, j) => j !== i))} className="mt-5 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set('diplomes', [...form.diplomes, { nom: '', etablissement: '', annee: '' }])} className="flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors">
          <Plus size={12} /> Ajouter un diplôme
        </button>
      </div>

      <Field label="Langues parlées">
        <div className="flex flex-wrap gap-2">
          {LANGUES.map(l => (
            <button key={l} type="button" onClick={() => toggleArr('langues', l)}
              className={clsx('px-3 py-1.5 rounded-lg border text-xs transition-all', form.langues.includes(l) ? 'bg-green-600/20 border-green-500/50 text-green-400 font-medium' : 'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8]')}>
              {l}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )

  const renderFormations = () => (
    <div className="space-y-6">
      <SectionTitle icon={BookOpen} title="Formations militaires" subtitle="Cursus militaire, certifications et spécialisations" />

      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Formations suivies</div>
        {form.formations.map((f, i) => (
          <div key={i} className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4 mb-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-start">
            <Field label="Formation">
              <input value={f.nom} onChange={e => { const arr = [...form.formations]; arr[i].nom = e.target.value; set('formations', arr) }} className="mil-input w-full text-xs" placeholder="Nom de la formation..." />
            </Field>
            <Field label="Centre">
              <select value={f.centre} onChange={e => { const arr = [...form.formations]; arr[i].centre = e.target.value; set('formations', arr) }} className="mil-select w-full text-xs">
                <option value="">Centre...</option>
                <option value="ESOF">ESOF — École Supérieure des Officiers</option>
                <option value="ETI">ETI — École de Transmission et Informatique</option>
                <option value="ESA">ESA — École du Service de Santé</option>
                <option value="autre">Autre / Externe</option>
              </select>
            </Field>
            <Field label="Début">
              <input type="date" value={f.dateDebut} onChange={e => { const arr = [...form.formations]; arr[i].dateDebut = e.target.value; set('formations', arr) }} className="mil-input w-full text-xs" />
            </Field>
            <Field label="Fin">
              <input type="date" value={f.dateFin} onChange={e => { const arr = [...form.formations]; arr[i].dateFin = e.target.value; set('formations', arr) }} className="mil-input w-full text-xs" />
            </Field>
            <div className="flex gap-2">
              <div className="flex-1">
                <Field label="Résultat">
                  <select value={f.resultat} onChange={e => { const arr = [...form.formations]; arr[i].resultat = e.target.value; set('formations', arr) }} className="mil-select w-full text-xs">
                    <option value="">—</option>
                    <option value="admis">Admis</option>
                    <option value="admis_mention">Admis avec mention</option>
                    <option value="echec">Échec</option>
                    <option value="en_cours">En cours</option>
                  </select>
                </Field>
              </div>
              {i > 0 && <button type="button" onClick={() => set('formations', form.formations.filter((_, j) => j !== i))} className="mt-5 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set('formations', [...form.formations, { nom: '', centre: '', dateDebut: '', dateFin: '', resultat: '' }])} className="flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors">
          <Plus size={12} /> Ajouter une formation
        </button>
      </div>

      <Field label="Spécialisations militaires">
        <div className="flex flex-wrap gap-2">
          {SPECIALISATIONS.map(s => (
            <button key={s} type="button" onClick={() => toggleArr('specialisations', s)}
              className={clsx('px-3 py-1.5 rounded-lg border text-xs transition-all', form.specialisations.includes(s) ? 'bg-green-600/20 border-green-500/50 text-green-400 font-medium' : 'border-[#1e321e] text-[#5a705a] hover:text-[#e8f0e8]')}>
              {s}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )

  const renderAptitudes = () => (
    <div className="space-y-6">
      <SectionTitle icon={Zap} title="Aptitudes professionnelles" subtitle="Compétences opérationnelles et certifications" />

      <Field label="Compétences militaires">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMPETENCES.map(c => (
            <label key={c} className={clsx('flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all', form.competences.includes(c) ? 'border-green-500/40 bg-green-500/5' : 'border-[#1e321e] bg-[#0a110a] hover:border-[#2a3e2a]')}>
              <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0', form.competences.includes(c) ? 'border-green-500 bg-green-500' : 'border-[#2a3e2a]')} onClick={() => toggleArr('competences', c)}>
                {form.competences.includes(c) && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className="text-xs text-[#8fa88f]">{c}</span>
            </label>
          ))}
        </div>
      </Field>

      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Certifications professionnelles</div>
        {form.certifications.map((c, i) => (
          <div key={i} className="grid grid-cols-3 gap-3 mb-3 items-start">
            <Field label="Certificat">
              <input value={c.nom} onChange={e => { const arr = [...form.certifications]; arr[i].nom = e.target.value; set('certifications', arr) }} className="mil-input w-full text-xs" placeholder="Nom du certificat..." />
            </Field>
            <Field label="Date d'obtention">
              <input type="date" value={c.date} onChange={e => { const arr = [...form.certifications]; arr[i].date = e.target.value; set('certifications', arr) }} className="mil-input w-full text-xs" />
            </Field>
            <div className="flex gap-2">
              <div className="flex-1">
                <Field label="Date d'expiration">
                  <input type="date" value={c.expiration} onChange={e => { const arr = [...form.certifications]; arr[i].expiration = e.target.value; set('certifications', arr) }} className="mil-input w-full text-xs" />
                </Field>
              </div>
              {i > 0 && <button type="button" onClick={() => set('certifications', form.certifications.filter((_, j) => j !== i))} className="mt-5 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => set('certifications', [...form.certifications, { nom: '', date: '', expiration: '' }])} className="flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors">
          <Plus size={12} /> Ajouter une certification
        </button>
      </div>
    </div>
  )

  const renderMedical = () => (
    <div className="space-y-6">
      <SectionTitle icon={Stethoscope} title="Dossier médical" subtitle="Données de santé, aptitude physique et vaccinations" />
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-2">
        <Lock size={13} className="text-yellow-400 flex-shrink-0" />
        <span className="text-[11px] text-yellow-300">Données médicales classifiées — accès restreint au personnel médical autorisé</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Field label="Groupe sanguin">
          <select value={form.groupeSanguin} onChange={e => set('groupeSanguin', e.target.value)} className="mil-select w-full text-xs">
            {GROUPS_SANGUINS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Taille (cm)">
          <input type="number" value={form.taille} onChange={e => set('taille', e.target.value)} className="mil-input w-full text-xs" placeholder="175" />
        </Field>
        <Field label="Poids (kg)">
          <input type="number" value={form.poids} onChange={e => set('poids', e.target.value)} className="mil-input w-full text-xs" placeholder="75" />
        </Field>
        <Field label="Aptitude médicale" required>
          <select value={form.aptitudeMedicale} onChange={e => set('aptitudeMedicale', e.target.value)} className="mil-select w-full text-xs">
            <option value="apte">Apte</option>
            <option value="apte_restriction">Apte avec restriction</option>
            <option value="inapte_temp">Inapte temporaire</option>
            <option value="inapte_def">Inapte définitif</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Allergies connues">
          <textarea value={form.allergies} onChange={e => set('allergies', e.target.value)} className="mil-input w-full text-xs h-20 resize-none" placeholder="Pénicilline, arachides, latex..." />
        </Field>
        <Field label="Antécédents médicaux">
          <textarea value={form.antecedents} onChange={e => set('antecedents', e.target.value)} className="mil-input w-full text-xs h-20 resize-none" placeholder="Maladies chroniques, opérations chirurgicales..." />
        </Field>
        {form.aptitudeMedicale !== 'apte' && (
          <Field label="Restrictions physiques">
            <textarea value={form.restrictions} onChange={e => set('restrictions', e.target.value)} className="mil-input w-full text-xs h-20 resize-none" placeholder="Décrire les restrictions..." />
          </Field>
        )}
      </div>
      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Vaccinations obligatoires</div>
        <div className="space-y-2">
          {form.vaccinations.map((v, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-center">
              <input value={v.nom} onChange={e => { const arr = [...form.vaccinations]; arr[i].nom = e.target.value; set('vaccinations', arr) }} className="mil-input text-xs" placeholder="Nom du vaccin..." />
              <div className="flex items-center gap-2 col-span-2">
                <Field label="Date de vaccination">
                  <input type="date" value={v.date} onChange={e => { const arr = [...form.vaccinations]; arr[i].date = e.target.value; set('vaccinations', arr) }} className="mil-input w-full text-xs" />
                </Field>
                {i >= 2 && <button type="button" onClick={() => set('vaccinations', form.vaccinations.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={12} /></button>}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => set('vaccinations', [...form.vaccinations, { nom: '', date: '' }])} className="flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors">
            <Plus size={12} /> Ajouter un vaccin
          </button>
        </div>
      </div>
    </div>
  )

  const renderEquipements = () => (
    <div className="space-y-6">
      <SectionTitle icon={Package} title="Équipements attribués" subtitle="Armement personnel, dotation militaire et véhicule" />
      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium flex items-center gap-2"><Sword size={11} /> Armement attribué</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Arme principale">
            <select value={form.armePrincipale} onChange={e => set('armePrincipale', e.target.value)} className="mil-select w-full text-xs">
              <option value="">Sélectionner...</option>
              <option>Fusil AK-47 (7,62mm)</option>
              <option>Carabine M4A1 (5,56mm)</option>
              <option>FN FAL (7,62mm)</option>
              <option>Fusil de précision SVD</option>
              <option>Pistolet Glock 17</option>
              <option>Mitrailleuse PKM</option>
            </select>
          </Field>
          <Field label="N° de série arme principale">
            <input value={form.armeNumSerie} onChange={e => set('armeNumSerie', e.target.value)} className="mil-input w-full text-xs font-mono" placeholder="AK47-RDC-XXXXX" />
          </Field>
          <Field label="Arme secondaire">
            <select value={form.armeSecondaire} onChange={e => set('armeSecondaire', e.target.value)} className="mil-select w-full text-xs">
              <option value="">Aucune</option>
              <option>Pistolet Beretta M9</option>
              <option>Pistolet Glock 19</option>
              <option>Couteau de combat</option>
            </select>
          </Field>
        </div>
      </div>
      <div>
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Dotation matérielle</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'uniforme', label: 'Uniforme réglementaire', icon: '👘' },
            { key: 'giletPareBalle', label: 'Gilet pare-balles', icon: '🛡️' },
            { key: 'casque', label: 'Casque balistique', icon: '⛑️' },
            { key: 'radio', label: 'Radio tactique', icon: '📻' },
          ].map(item => (
            <label key={item.key} className={clsx('flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all', (form as any)[item.key] ? 'border-green-500/40 bg-green-500/5' : 'border-[#1e321e] bg-[#0a110a]')}>
              <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0', (form as any)[item.key] ? 'border-green-500 bg-green-500' : 'border-[#2a3e2a]')} onClick={() => set(item.key as keyof FormData, !(form as any)[item.key])}>
                {(form as any)[item.key] && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className="text-sm">{item.icon}</span>
              <span className="text-xs text-[#8fa88f]">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
      <Field label="Véhicule attribué (immatriculation)">
        <input value={form.vehiculeAttribue} onChange={e => set('vehiculeAttribue', e.target.value)} className="mil-input w-full text-xs font-mono max-w-xs" placeholder="FARDC-LGR-XXX ou vide" />
      </Field>
    </div>
  )

  const renderOperations = () => (
    <div className="space-y-6">
      <SectionTitle icon={Target} title="Missions opérationnelles" subtitle="Historique des affectations et missions du militaire" />
      <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#e8f0e8]">Historique des affectations</span>
          <button type="button" className="btn-primary text-[10px] px-2.5 py-1.5"><Plus size={11} /> Ajouter</button>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-[#1e321e]">
            {['Date', 'Ancienne unité', 'Nouvelle unité', 'Motif', 'Autorité'].map(h => <th key={h} className="px-3 py-2 text-left text-[10px] text-[#5a705a] uppercase">{h}</th>)}
          </tr></thead>
          <tbody>
            <tr className="border-b border-[#1e321e]/50">
              <td className="px-3 py-2 text-[#8fa88f] italic" colSpan={5}>Aucune affectation précédente enregistrée — premier enregistrement.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#e8f0e8]">Missions opérationnelles</span>
          <button type="button" className="btn-primary text-[10px] px-2.5 py-1.5"><Plus size={11} /> Lier à une mission</button>
        </div>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-[#1e321e]">
            {['Mission', 'Zone', 'Période', 'Statut', 'Résultat'].map(h => <th key={h} className="px-3 py-2 text-left text-[10px] text-[#5a705a] uppercase">{h}</th>)}
          </tr></thead>
          <tbody>
            <tr><td className="px-3 py-2 text-[#8fa88f] italic" colSpan={5}>Aucune mission liée à ce dossier.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderDisciplinaire = () => (
    <div className="space-y-6">
      <SectionTitle icon={Scale} title="Dossier disciplinaire & Récompenses" subtitle="Avertissements, sanctions, décorations et médailles" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Avertissements / Blâmes', color: 'yellow', items: [] },
          { title: 'Sanctions / Suspensions', color: 'red', items: [] },
          { title: 'Décorations militaires', color: 'purple', items: [] },
          { title: 'Médailles & Distinctions', color: 'blue', items: [] },
        ].map(section => (
          <div key={section.title} className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#e8f0e8]">{section.title}</span>
              <button type="button" className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1"><Plus size={10} /> Ajouter</button>
            </div>
            <div className="text-[11px] text-[#5a705a] italic">Aucun enregistrement — dossier vierge.</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFinances = () => (
    <div className="space-y-6">
      <SectionTitle icon={DollarSign} title="Gestion financière" subtitle="Compte, solde de base et paramètres de rémunération" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Field label="Mode de paiement">
          <select className="mil-select w-full text-xs">
            <option value="virement">Virement bancaire</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="especes">Espèces</option>
          </select>
        </Field>
        <Field label="Numéro de compte / Wallet">
          <input className="mil-input w-full text-xs font-mono" placeholder="IBAN / Numéro M-Pesa..." />
        </Field>
        <Field label="Nom de la banque / Opérateur">
          <input className="mil-input w-full text-xs" placeholder="Ex: Rawbank, Orange Money..." />
        </Field>
      </div>
      <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4">
        <div className="text-[11px] text-[#5a705a] uppercase tracking-wider mb-3 font-medium">Barème indicatif — calculé à partir du grade</div>
        {form.grade ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Salaire de base', val: `$${gradesList.find(g => g.nom === form.grade)?.salaireBase || 0}` },
              { label: 'Prime de risque (estimée)', val: '$80 — $250' },
              { label: 'Prime ancienneté (0 an)', val: '$0' },
            ].map(r => (
              <div key={r.label} className="p-3 border border-[#1e321e] rounded-xl text-center">
                <div className="text-xs font-bold text-green-400">{r.val}</div>
                <div className="text-[9px] text-[#5a705a] mt-0.5">{r.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[11px] text-[#5a705a] italic">Sélectionnez le grade dans l&apos;onglet Affectation pour calculer la rémunération.</div>
        )}
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <SectionTitle icon={FileText} title="Documents numériques" subtitle="Pièces justificatives et documents officiels du dossier" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { label: 'Carte militaire', required: true },
          { label: 'Carte nationale d\'identité', required: true },
          { label: 'Passeport', required: false },
          { label: 'Acte de naissance', required: true },
          { label: 'Diplômes scolaires', required: false },
          { label: 'Certificats militaires', required: false },
          { label: 'Permis de conduire', required: false },
          { label: 'Documents médicaux', required: false },
          { label: 'Contrat d\'engagement', required: true },
          { label: 'Photo officielle (3×4)', required: true },
        ].map(doc => (
          <div key={doc.label} className="flex items-center justify-between p-3 bg-[#0a110a] border border-dashed border-[#1e321e] rounded-xl hover:border-[#2a3e2a] transition-all">
            <div className="flex items-center gap-2">
              <FileText size={13} className="text-[#5a705a]" />
              <span className="text-xs text-[#8fa88f]">{doc.label}</span>
              {doc.required && <span className="text-[9px] text-red-400">*</span>}
            </div>
            <button type="button" className="flex items-center gap-1.5 text-[11px] text-green-400 hover:text-green-300 transition-colors">
              <Upload size={11} /> Joindre
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderIA = () => (
    <div className="space-y-6">
      <SectionTitle icon={Bot} title="IA & Sécurité / Traçabilité" subtitle="Analyse intelligente du dossier et journalisation d'audit" />

      {/* IA Panel */}
      <div className="bg-[#0a110a] border border-purple-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-[#e8f0e8]">Analyse IA — Évaluation automatique du profil</span>
          <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-bold ml-auto">BÊTA</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Risque opérationnel', val: form.statut === 'en_mission' ? 'ÉLEVÉ' : 'MODÉRÉ', color: 'text-yellow-400' },
            { label: 'Aptitude aux missions', val: form.aptitudeMedicale === 'apte' ? 'CONFIRMÉE' : 'RESTREINTE', color: form.aptitudeMedicale === 'apte' ? 'text-green-400' : 'text-orange-400' },
            { label: 'Besoin en formation', val: form.specialisations.length < 2 ? 'RECOMMANDÉ' : 'À JOUR', color: form.specialisations.length < 2 ? 'text-blue-400' : 'text-green-400' },
            { label: 'Disponibilité', val: form.statut === 'actif' ? '100%' : '0%', color: form.statut === 'actif' ? 'text-green-400' : 'text-red-400' },
          ].map(r => (
            <div key={r.label} className="bg-[#141e14] border border-[#1e321e] rounded-xl p-3 text-center">
              <div className={clsx('text-sm font-bold', r.color)}>{r.val}</div>
              <div className="text-[9px] text-[#5a705a] mt-0.5">{r.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-[11px] text-purple-300">
          <span className="font-bold">Recommandations IA : </span>
          {form.specialisations.length === 0 ? 'Aucune spécialisation renseignée — recommande formation Infanterie de base. ' : ''}
          {!form.grade ? 'Grade non renseigné — compléter l\'onglet Affectation. ' : ''}
          {form.vaccinations.filter(v => v.date).length < 2 ? 'Vaccinations incomplètes — compléter le dossier médical. ' : ''}
          {form.langues.length >= 2 ? 'Profil bilingue détecté — avantage pour missions internationales. ' : ''}
          {form.nom && form.prenom && form.grade && form.unite ? '✓ Dossier complet — éligible à l\'activation du compte MILSYS.' : ''}
        </div>
      </div>

      {/* Audit trail */}
      <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={14} className="text-green-400" />
          <span className="text-xs font-semibold text-[#e8f0e8]">Traçabilité & Sécurité</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            ['Créé par', 'Gal Bde KABILA Jean-Pierre'],
            ['Date de création', new Date().toLocaleString('fr-FR')],
            ['Adresse IP', '192.168.10.1'],
            ['Appareil', 'PC-BUREAU-01'],
            ['Position GPS', '-4.3200, 15.3200'],
            ['Niveau de conf.', form.niveauConfidentialite.toUpperCase()],
          ].map(([l, v]) => (
            <div key={l} className="p-3 border border-[#1e321e] rounded-xl">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
              <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Notes de création (internes)">
            <textarea value={form.notesCreation} onChange={e => set('notesCreation', e.target.value)} className="mil-input w-full text-xs h-16 resize-none" placeholder="Observations du créateur du dossier..." />
          </Field>
        </div>
      </div>

      {/* Validation hierarchy */}
      <div className="bg-[#0a110a] border border-[#1e321e] rounded-xl p-4">
        <div className="text-xs font-semibold text-[#e8f0e8] mb-3 flex items-center gap-2"><CheckCircle size={13} className="text-green-400" /> Circuit de validation hiérarchique</div>
        <div className="flex items-center gap-2 flex-wrap">
          {['Créateur', '→', 'Chef d\'unité', '→', 'Commandant de Base', '→', 'Admin Provincial', '→', 'Admin National'].map((step, i) => (
            <span key={i} className={clsx('text-[11px]', step === '→' ? 'text-[#5a705a]' : 'bg-[#141e14] border border-[#1e321e] px-2.5 py-1.5 rounded-lg text-[#8fa88f] font-medium')}>
              {step}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-[#5a705a] mt-2">Le dossier ne sera activé qu&apos;après validation complète de la chaîne hiérarchique.</p>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (tab) {
      case 'identite': return renderIdentite()
      case 'famille': return renderFamille()
      case 'coordonnees': return renderCoordonnes()
      case 'militaire': return renderMilitaire()
      case 'recrutement': return renderRecrutement()
      case 'academique': return renderAcademique()
      case 'formations': return renderFormations()
      case 'aptitudes': return renderAptitudes()
      case 'medical': return renderMedical()
      case 'equipements': return renderEquipements()
      case 'operations': return renderOperations()
      case 'disciplinaire': return renderDisciplinaire()
      case 'finances': return renderFinances()
      case 'documents': return renderDocuments()
      case 'ia': return renderIA()
      default: return null
    }
  }

  // ── Main layout ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Enregistrement d'un militaire"
        subtitle={`Nouveau dossier · Matricule : ${form.matricule}`}
      />

      {/* Top action bar */}
      <div className="px-4 lg:px-6 py-3 border-b border-[#1e321e] bg-[#0a110a] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-[#5a705a] hover:text-[#e8f0e8] transition-colors">
            <ChevronLeft size={14} /> Retour
          </button>
          {/* Progress */}
          <div className="flex items-center gap-2 bg-[#141e14] border border-[#1e321e] rounded-lg px-3 py-1.5">
            <div className="w-24 bg-[#1e321e] rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-[#8fa88f]">{progress}% complet</span>
          </div>
          <span className="text-[10px] font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">
            {form.matricule}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" className="btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1.5"><Printer size={12} /> Imprimer</button>
          <button type="button" className="btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1.5"><Download size={12} /> Export PDF</button>
          <button type="button" className="btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1.5"><QrCode size={12} /> QR Code</button>
          <button type="button" className="btn-secondary text-[11px] px-3 py-1.5 flex items-center gap-1.5"><CreditCard size={12} /> Carte mil.</button>
          <button type="button" onClick={handleSave} className="btn-primary text-[11px] px-4 py-1.5 flex items-center gap-1.5">
            <Save size={12} /> {saved ? '✓ Enregistré!' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="mx-4 mt-3 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3 animate-pulse">
          <CheckCircle size={16} className="text-green-400" />
          <span className="text-sm font-semibold text-green-300">Dossier enregistré avec succès — redirection vers la liste du personnel...</span>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

        {/* LEFT: Section navigation */}
        <div className="lg:w-56 border-r border-[#1e321e] bg-[#0a110a] overflow-y-auto flex-shrink-0">
          <nav className="p-2 space-y-0.5">
            {TABS.map(t => {
              const Icon = t.icon
              const isComplete = completedTabs > 0 && ['identite', 'famille', 'coordonnees', 'militaire', 'medical'].includes(t.id) &&
                (() => {
                  if (t.id === 'identite') return !!(form.nom && form.prenom && form.dateNaissance && form.grade)
                  if (t.id === 'famille') return !!(form.urgenceNom && form.urgenceTel)
                  if (t.id === 'coordonnees') return !!(form.province && form.ville && form.telPrincipal)
                  if (t.id === 'militaire') return !!(form.unite && form.grade && form.statut)
                  if (t.id === 'medical') return !!(form.aptitudeMedicale)
                  return false
                })()
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={sectionNavClass(t.id)}
                >
                  <Icon size={13} className="flex-shrink-0" />
                  <span className="flex-1 truncate text-[11px]">{t.label}</span>
                  {isComplete && <CheckCircle size={10} className={tab === t.id ? 'text-white/70' : 'text-green-400'} />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* RIGHT: Section content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <form onSubmit={e => e.preventDefault()}>
            {renderSection()}
          </form>

          {/* Bottom nav */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#1e321e]">
            <button
              type="button"
              onClick={() => setTab(TABS[Math.max(0, tabIdx - 1)].id)}
              disabled={tabIdx === 0}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-30"
            >
              <ChevronLeft size={13} /> Section précédente
            </button>
            <span className="text-[10px] text-[#5a705a]">{tabIdx + 1} / {TABS.length}</span>
            {tabIdx < TABS.length - 1 ? (
              <button
                type="button"
                onClick={() => setTab(TABS[tabIdx + 1].id)}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                Section suivante <ChevronRight size={13} />
              </button>
            ) : (
              <button type="button" onClick={handleSave} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Save size={13} /> Enregistrer le dossier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
