'use client';

import { useState, useRef } from 'react';
import React from 'react';
import { UserPlus, Eye, Edit2, Download, Upload, Filter, Users, UserCheck, Activity, RefreshCw, AlertCircle, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import StatCard from '@/components/ui/StatCard';
import { useMilitaireContext, useAddMilitaire } from '@/context/MilitaireContext';
import type { Militaire } from '@/services/personnel.service';

const STATUT_LABELS: Record<string, string> = {
  actif: 'Actif',
  mission: 'En mission',
  formation: 'En formation',
  permission: 'En permission',
  hopital: 'Hôpital',
  retraite: 'Retraité',
  blesse: 'Blessé',
  suspendu: 'Suspendu',
  desertion: 'Désertion',
  deces: 'Décédé',
};

const FORCE_LABELS: Record<string, string> = {
  terrestre: 'Force Terrestre',
  aerienne: 'Force Aérienne',
  maritime: 'Force Navale',
  emg: 'État-Major',
};

// ── Utilitaires CSV ──────────────────────────────────────────────────────────

const CSV_HEADERS = ['matricule', 'nom', 'prenom', 'grade', 'unite', 'force', 'statut', 'province', 'telephone', 'email', 'fonction'];
const CSV_LABELS  = ['Matricule', 'Nom', 'Prénom', 'Grade', 'Unité', 'Force', 'Statut', 'Province', 'Téléphone', 'Email', 'Fonction'];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? [];
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').replace(/^"|"$/g, '').trim(); });
    return obj;
  }).filter(r => Object.values(r).some(v => v));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PersonnelPage() {
  const { militaires, total, isLoading, error, reload } = useMilitaireContext();
  const addMilitaire = useAddMilitaire();

  const [selected, setSelected] = useState<Militaire | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');
  const [saving, setSaving] = useState(false);
  const [importRows, setImportRows] = useState<Record<string, string>[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importDone, setImportDone] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    nom: '', prenom: '', matricule: '', dateNaissance: '',
    sexe: 'M', force: 'terrestre', grade: '', unite: '',
    fonction: '', groupeSanguin: '', telephone: '', province: '',
  };

  // Nouveau formulaire
  const [form, setForm] = useState(emptyForm);

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const header = CSV_LABELS.join(',');
    const rows = militaires.map(m => CSV_HEADERS.map(key => {
      let val = '';
      if (key === 'grade') val = getGradeLabel(m);
      else if (key === 'unite') val = getUniteLabel(m);
      else if (key === 'force') val = FORCE_LABELS[m.force] ?? m.force;
      else if (key === 'statut') val = STATUT_LABELS[m.statut] ?? m.statut;
      else val = String((m as unknown as Record<string, unknown>)[key] ?? '');
      return `"${val.replace(/"/g, '""')}"`;
    }).join(','));
    const csv = '﻿' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personnel_fardc_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Import CSV ──────────────────────────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setImportRows(rows);
      setImportDone(0);
      setShowImport(true);
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleImportSubmit = async () => {
    setImportLoading(true);
    let done = 0;
    for (const row of importRows) {
      try {
        await addMilitaire({
          matricule: row.matricule || `IMP-${Date.now()}-${done}`,
          nom: row.nom || '—',
          prenom: row.prenom || '—',
          grade: row.grade,
          unite: row.unite,
          force: (row.force?.toLowerCase() as Militaire['force']) || 'terrestre',
          statut: (row.statut?.toLowerCase() as Militaire['statut']) || 'actif',
          province: row.province,
          telephone: row.telephone,
          email: row.email,
          fonction: row.fonction,
        });
        done++;
        setImportDone(done);
      } catch { /* ignore row errors */ }
    }
    setImportLoading(false);
    setTimeout(() => { setShowImport(false); setImportRows([]); reload(); }, 1200);
  };

  // ── Modifier ────────────────────────────────────────────────────────────────
  const handleEditOpen = (m: Militaire) => {
    setForm({
      nom: m.nom ?? '',
      prenom: m.prenom ?? '',
      matricule: m.matricule ?? '',
      dateNaissance: m.dateNaissance ? m.dateNaissance.slice(0, 10) : '',
      sexe: m.sexe ?? 'M',
      force: m.force ?? 'terrestre',
      grade: getGradeLabel(m),
      unite: getUniteLabel(m),
      fonction: m.fonction ?? '',
      groupeSanguin: m.groupeSanguin ?? '',
      telephone: m.telephone ?? '',
      province: m.province ?? '',
    });
    setSelected(null);
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // placeholder — API PATCH à câbler
      setShowEdit(false);
      setForm(emptyForm);
      reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterStatut
    ? militaires.filter(m => m.statut === filterStatut)
    : militaires;

  // Stats rapides calculées localement
  const stats = {
    total,
    actifs: militaires.filter(m => m.statut === 'actif').length,
    enMission: militaires.filter(m => m.statut === 'mission').length,
    blesses: militaires.filter(m => m.statut === 'blesse').length,
  };

  const getGradeLabel = (m: Militaire) =>
    typeof m.grade === 'object' ? m.grade.abreviation || m.grade.nom : m.gradeNom || String(m.grade);

  const getUniteLabel = (m: Militaire) =>
    typeof m.unite === 'object' ? m.unite.nom : m.uniteNom || String(m.unite);

  const columns: { key: string; header: string; sortable?: boolean; render: (m: Militaire) => React.ReactNode }[] = [
    {
      key: 'matricule',
      header: 'Matricule',
      sortable: true,
      render: m => <span className="font-mono text-[11px] text-green-400">{m.matricule}</span>,
    },
    {
      key: 'nom',
      header: 'Nom complet',
      sortable: true,
      render: m => (
        <div>
          <div className="font-medium text-[#e8f0e8] text-xs">{m.nom} {m.prenom}</div>
          <div className="text-[10px] text-[#5a705a]">{FORCE_LABELS[m.force] ?? m.force}</div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: 'Grade',
      sortable: true,
      render: m => <span className="text-xs text-[#e8f0e8]">{getGradeLabel(m)}</span>,
    },
    {
      key: 'unite',
      header: 'Unité',
      render: m => <span className="text-xs font-mono text-[#8fa88f]">{getUniteLabel(m)}</span>,
    },
    {
      key: 'province',
      header: 'Province',
      sortable: true,
      render: m => <span className="text-xs text-[#8fa88f]">{m.province ?? '—'}</span>,
    },
    {
      key: 'statut',
      header: 'Statut',
      render: m => (
        <Badge label={STATUT_LABELS[m.statut] ?? m.statut} variant={m.statut as 'actif' | 'blesse' | 'suspendu'} dot />
      ),
    },
  ];

  const handleSave = async () => {
    if (!form.nom || !form.prenom || !form.matricule) return;
    setSaving(true);
    try {
      await addMilitaire({
        ...form,
        dateNaissance: form.dateNaissance ? new Date(form.dateNaissance).toISOString() : undefined,
        sexe: form.sexe as 'M' | 'F',
        force: form.force as Militaire['force'],
      });
      setShowAdd(false);
      setForm({ nom: '', prenom: '', matricule: '', dateNaissance: '', sexe: 'M', force: 'terrestre', grade: '', unite: '', fonction: '', groupeSanguin: '', telephone: '', province: '' });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Gestion du personnel militaire"
        subtitle={`${total.toLocaleString('fr-FR')} militaires · Base de données nationale FARDC`}
      />
      {/* Input fichier caché pour l'import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        aria-label="Importer un fichier CSV"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Erreur API */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <AlertCircle size={16} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-yellow-400 font-medium">Connexion backend indisponible — données de démo affichées</p>
              <p className="text-[10px] text-yellow-400/70 mt-0.5">{error}</p>
            </div>
            <button type="button" onClick={reload} className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1">
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Total personnel" value={isLoading ? '…' : stats.total} icon={<Users size={18} />} color="green" size="sm" />
          <StatCard title="Actifs" value={isLoading ? '…' : stats.actifs} icon={<UserCheck size={18} />} color="blue" size="sm" />
          <StatCard title="En mission" value={isLoading ? '…' : stats.enMission} icon={<Users size={18} />} color="yellow" size="sm" />
          <StatCard title="Blessés" value={isLoading ? '…' : stats.blesses} icon={<Activity size={18} />} color="red" size="sm" />
        </div>

        {/* Table Card */}
        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Users size={15} className="text-green-400" />
              <span className="text-sm font-semibold text-[#e8f0e8]">Liste du personnel</span>
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={handleImportClick} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <Upload size={13} /> Importer
              </button>
              <button type="button" onClick={handleExport} disabled={militaires.length === 0} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                <Download size={13} /> Exporter
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                <UserPlus size={13} /> Nouveau militaire
              </button>
            </div>
          </div>
          <div className="p-4">
            <DataTable
              data={filtered}
              columns={columns}
              searchPlaceholder="Rechercher par matricule, nom, grade..."
              pageSize={10}
              toolbar={
                <div className="flex items-center gap-2">
                  <Filter size={13} className="text-[#5a705a]" />
                  <select
                    aria-label="Filtrer par statut"
                    value={filterStatut}
                    onChange={e => setFilterStatut(e.target.value)}
                    className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none focus:border-green-500/50"
                  >
                    <option value="">Tous statuts</option>
                    {Object.entries(STATUT_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              }
              actions={(m: Militaire) => (
                <>
                  <button
                    type="button"
                    onClick={() => setSelected(m)}
                    className="p-1.5 rounded-lg text-[#5a705a] hover:text-green-400 hover:bg-green-500/10 transition-all"
                    title="Voir le dossier"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditOpen(m)}
                    className="p-1.5 rounded-lg text-[#5a705a] hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Modifier"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Modal Détail ─────────────────────────────────────────────────── */}
      {selected && (
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`Dossier — ${getGradeLabel(selected)} ${selected.nom} ${selected.prenom}`}
          subtitle={`Matricule : ${selected.matricule}`}
          size="lg"
          footer={
            <>
              <button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>
              <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={() => selected && handleEditOpen(selected)}>
                <Edit2 size={13} /> Modifier le dossier
              </button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="w-16 h-16 rounded-xl bg-green-800 flex items-center justify-center text-white text-xl font-bold border border-green-600/40 flex-shrink-0">
                {selected.prenom[0]}{selected.nom[0]}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#e8f0e8]">{selected.nom} {selected.prenom}</h3>
                <p className="text-sm text-[#8fa88f]">{getGradeLabel(selected)} · {FORCE_LABELS[selected.force] ?? selected.force}</p>
                <p className="text-xs text-[#5a705a] font-mono mt-0.5">{selected.matricule}</p>
                <div className="mt-2">
                  <Badge label={STATUT_LABELS[selected.statut] ?? selected.statut} variant={selected.statut as 'actif' | 'blesse' | 'suspendu'} dot />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ['Date de naissance', selected.dateNaissance ? new Date(selected.dateNaissance).toLocaleDateString('fr-FR') : '—'],
                ['Sexe', selected.sexe === 'M' ? 'Masculin' : 'Féminin'],
                ['Force', FORCE_LABELS[selected.force] ?? selected.force],
                ['Unité', getUniteLabel(selected)],
                ['Fonction', selected.fonction ?? '—'],
                ['Spécialité', selected.specialite ?? '—'],
                ['Groupe sanguin', selected.groupeSanguin ?? '—'],
                ['Province', selected.province ?? '—'],
                ['Téléphone', selected.telephone ?? '—'],
                ['Email', selected.email ?? '—'],
                ['Date d\'engagement', selected.dateEngagement ? new Date(selected.dateEngagement).toLocaleDateString('fr-FR') : '—'],
                ['Années de service', selected.anneesService != null ? `${selected.anneesService} ans` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="space-y-0.5">
                  <span className="text-[10px] text-[#5a705a] uppercase tracking-wider">{label}</span>
                  <div className="text-xs text-[#e8f0e8] font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Modal Ajout ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Enregistrer un nouveau militaire"
        subtitle="Création d'un dossier individuel"
        size="xl"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => setShowAdd(false)}>Annuler</button>
            <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={handleSave} disabled={saving}>
              {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              Enregistrer le dossier
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'matricule', label: 'Matricule *', placeholder: 'ex: MIL-2024-001' },
            { key: 'nom', label: 'Nom *', placeholder: 'Nom de famille' },
            { key: 'prenom', label: 'Prénom *', placeholder: 'Prénom' },
            { key: 'dateNaissance', label: 'Date de naissance', placeholder: '', type: 'date' },
            { key: 'telephone', label: 'Téléphone', placeholder: '+243...' },
            { key: 'province', label: 'Province', placeholder: 'Province d\'affectation' },
            { key: 'fonction', label: 'Fonction', placeholder: 'Fonction exercée' },
          ] as { key: keyof typeof form; label: string; placeholder: string; type?: string }[]).map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="mil-input"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Sexe</label>
            <select aria-label="Sexe" className="mil-select" value={form.sexe} onChange={e => setForm(p => ({ ...p, sexe: e.target.value }))}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Force</label>
            <select aria-label="Force" className="mil-select" value={form.force} onChange={e => setForm(p => ({ ...p, force: e.target.value }))}>
              <option value="terrestre">Force Terrestre</option>
              <option value="aerienne">Force Aérienne</option>
              <option value="maritime">Force Navale</option>
              <option value="emg">État-Major</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Groupe sanguin</label>
            <select aria-label="Groupe sanguin" className="mil-select" value={form.groupeSanguin} onChange={e => setForm(p => ({ ...p, groupeSanguin: e.target.value }))}>
              <option value="">—</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* ── Modal Modifier ───────────────────────────────────────────────── */}
      <Modal
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setForm(emptyForm); }}
        title="Modifier le dossier militaire"
        subtitle={form.matricule ? `Matricule : ${form.matricule}` : ''}
        size="xl"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setShowEdit(false); setForm(emptyForm); }}>Annuler</button>
            <button type="button" className="btn-primary text-xs flex items-center gap-1.5" onClick={handleEditSave} disabled={saving}>
              {saving && <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />}
              Enregistrer les modifications
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'matricule', label: 'Matricule', placeholder: 'ex: MIL-2024-001' },
            { key: 'nom', label: 'Nom', placeholder: 'Nom de famille' },
            { key: 'prenom', label: 'Prénom', placeholder: 'Prénom' },
            { key: 'dateNaissance', label: 'Date de naissance', placeholder: '', type: 'date' },
            { key: 'grade', label: 'Grade', placeholder: 'Grade militaire' },
            { key: 'unite', label: 'Unité', placeholder: 'Unité d\'affectation' },
            { key: 'telephone', label: 'Téléphone', placeholder: '+243...' },
            { key: 'province', label: 'Province', placeholder: 'Province d\'affectation' },
            { key: 'fonction', label: 'Fonction', placeholder: 'Fonction exercée' },
          ] as { key: keyof typeof form; label: string; placeholder: string; type?: string }[]).map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="mil-input"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Sexe</label>
            <select aria-label="Sexe" className="mil-select" value={form.sexe} onChange={e => setForm(p => ({ ...p, sexe: e.target.value }))}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Force</label>
            <select aria-label="Force" className="mil-select" value={form.force} onChange={e => setForm(p => ({ ...p, force: e.target.value }))}>
              <option value="terrestre">Force Terrestre</option>
              <option value="aerienne">Force Aérienne</option>
              <option value="maritime">Force Navale</option>
              <option value="emg">État-Major</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#8fa88f] mb-1 uppercase tracking-wider">Groupe sanguin</label>
            <select aria-label="Groupe sanguin" className="mil-select" value={form.groupeSanguin} onChange={e => setForm(p => ({ ...p, groupeSanguin: e.target.value }))}>
              <option value="">—</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* ── Modal Import CSV ─────────────────────────────────────────────── */}
      <Modal
        isOpen={showImport}
        onClose={() => { setShowImport(false); setImportRows([]); }}
        title="Importer du personnel"
        subtitle={`${importRows.length} enregistrement(s) détecté(s) dans le fichier`}
        size="xl"
        footer={
          <>
            <button type="button" className="btn-secondary text-xs" onClick={() => { setShowImport(false); setImportRows([]); }}>Annuler</button>
            <button
              type="button"
              className="btn-primary text-xs flex items-center gap-1.5"
              onClick={handleImportSubmit}
              disabled={importLoading || importRows.length === 0}
            >
              {importLoading
                ? <><Loader2 size={12} className="animate-spin" /> Import en cours… ({importDone}/{importRows.length})</>
                : importDone > 0
                  ? <><CheckCircle size={12} /> {importDone} importés</>
                  : <><Upload size={12} /> Confirmer l&apos;import</>
              }
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Aide format */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <FileSpreadsheet size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Format CSV attendu</div>
              <div className="font-mono text-[10px] text-blue-400 mt-0.5">
                {CSV_LABELS.join(', ')}
              </div>
            </div>
          </div>

          {/* Aperçu des données */}
          {importRows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-[#1e321e]">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-[#1e321e] bg-[#0a110a]">
                    {['Matricule', 'Nom', 'Prénom', 'Grade', 'Force', 'Statut', 'Province'].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-[#8fa88f] whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-3 py-2 text-center text-[#8fa88f]">État</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-[#1e321e]/50 hover:bg-[#0f1a0f]">
                      <td className="px-3 py-2 font-mono text-green-400">{row.matricule || '—'}</td>
                      <td className="px-3 py-2 text-[#e8f0e8]">{row.nom || '—'}</td>
                      <td className="px-3 py-2 text-[#e8f0e8]">{row.prenom || '—'}</td>
                      <td className="px-3 py-2 text-[#8fa88f]">{row.grade || '—'}</td>
                      <td className="px-3 py-2 text-[#8fa88f]">{row.force || '—'}</td>
                      <td className="px-3 py-2 text-[#8fa88f]">{row.statut || '—'}</td>
                      <td className="px-3 py-2 text-[#8fa88f]">{row.province || '—'}</td>
                      <td className="px-3 py-2 text-center">
                        {i < importDone
                          ? <CheckCircle size={12} className="text-green-400 mx-auto" />
                          : <div className="w-2 h-2 rounded-full bg-[#1e321e] mx-auto" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importRows.length > 20 && (
                <div className="px-4 py-2 text-[10px] text-[#5a705a] border-t border-[#1e321e]">
                  … et {importRows.length - 20} autres enregistrement(s)
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
