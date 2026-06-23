'use client'

import { useState, useEffect } from 'react'
import { Award, TrendingUp, ChevronRight, Star, ArrowUpCircle, RefreshCw } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import gradesService, { type Grade } from '@/services/grades.service'

const categorieLabels: Record<string, string> = {
  officier_general: 'Officier Général',
  officier_superieur: 'Officier Supérieur',
  officier_subalterne: 'Officier Subalterne',
  sous_officier: 'Sous-Officier',
  soldat: 'Homme du Rang',
}

const categorieColor: Record<string, string> = {
  officier_general: 'border-l-yellow-400 bg-yellow-400/5',
  officier_superieur: 'border-l-yellow-500 bg-yellow-500/5',
  officier_subalterne: 'border-l-blue-500 bg-blue-500/5',
  sous_officier: 'border-l-green-500 bg-green-500/5',
  soldat: 'border-l-gray-500 bg-gray-500/5',
}

const CATEGORIES = ['officier_general', 'officier_superieur', 'officier_subalterne', 'sous_officier', 'soldat']

const promotionsDraft = [
  { militaire: 'Cpt MUTOMBO David', grade_actuel: 'Capitaine', grade_propose: 'Commandant', anciennete: 10, recommande_par: 'Col MUTEBA', statut: 'en_cours' },
  { militaire: 'Lt LOKONDA Marie-Claire', grade_actuel: 'Lieutenant', grade_propose: 'Capitaine', anciennete: 7, recommande_par: 'LtCol NZUZI', statut: 'en_cours' },
  { militaire: 'Sgt BANZA Sylvie', grade_actuel: 'Sergent-Chef', grade_propose: 'Adjudant', anciennete: 9, recommande_par: 'Cdt LUSAMBA', statut: 'approuve' },
  { militaire: 'Sdt BOLAMBA Théodore', grade_actuel: 'Soldat', grade_propose: 'Caporal', anciennete: 3, recommande_par: 'Lt MWANGU', statut: 'en_attente' },
]

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Grade | null>(null)
  const [activeTab, setActiveTab] = useState<'catalogue' | 'promotions'>('catalogue')

  useEffect(() => {
    setIsLoading(true)
    gradesService.getAll({ limit: 100, sort: 'niveauHierarchique' })
      .then(res => setGrades((res.data as Grade[]) ?? []))
      .catch(() => {
        import('@/data/mockData').then(({ grades: mock }) => setGrades(mock as unknown as Grade[])).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const byCategorie = CATEGORIES.map(cat => ({
    cat,
    grades: grades.filter(g => g.categorie === cat),
  })).filter(x => x.grades.length > 0)

  return (
    <div className="flex flex-col h-full">
      <Header title="Grades & Promotions" subtitle="Catalogue des grades FARDC · Gestion des avancements" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#0f1a0f] border border-[#1e321e] rounded-xl p-1 w-fit">
          {(['catalogue', 'promotions'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-green-600 text-white' : 'text-[#5a705a] hover:text-[#e8f0e8]'
              }`}
            >
              {tab === 'catalogue' ? 'Catalogue des grades' : 'Promotions en cours'}
            </button>
          ))}
        </div>

        {activeTab === 'catalogue' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
              </div>
            ) : (
              byCategorie.map(({ cat, grades: catGrades }) => (
                <div key={cat} className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
                  <div className={`px-4 py-3 border-b border-[#1e321e] border-l-4 ${categorieColor[cat] ?? ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#e8f0e8]">{categorieLabels[cat]}</span>
                      <span className="text-xs text-[#5a705a]">{catGrades.length} grade{catGrades.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {catGrades.map(g => (
                      <button
                        key={g._id}
                        type="button"
                        onClick={() => setSelected(g)}
                        className="flex items-center gap-3 p-3 bg-[#0f1a0f] border border-[#1e321e] rounded-xl hover:border-green-500/40 hover:bg-[#141e14] transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-800/30 flex items-center justify-center flex-shrink-0">
                          <Award size={15} className="text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-[#e8f0e8] truncate">{g.nom}</div>
                          <div className="text-[10px] text-[#5a705a]">{g.abreviation} · Niv. {g.niveauHierarchique}</div>
                          <div className="text-[10px] text-[#5a705a]">
                            {g.salaireBase ? `${g.salaireBase.toLocaleString()} USD/mois` : g.force}
                          </div>
                        </div>
                        <ChevronRight size={13} className="text-[#5a705a] group-hover:text-green-400 transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={15} className="text-green-400" />
                <span className="text-sm font-semibold text-[#e8f0e8]">Dossiers de promotion en cours</span>
              </div>
              <button type="button" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <TrendingUp size={13} />
                Nouvelle proposition
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full mil-table">
                <thead>
                  <tr>
                    <th>Militaire</th>
                    <th>Grade actuel</th>
                    <th>Grade proposé</th>
                    <th>Ancienneté</th>
                    <th>Recommandé par</th>
                    <th>Statut</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotionsDraft.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Star size={12} className="text-yellow-400" />
                          <span className="text-xs font-medium text-[#e8f0e8]">{p.militaire}</span>
                        </div>
                      </td>
                      <td><span className="text-xs text-[#8fa88f]">{p.grade_actuel}</span></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-400 font-medium">{p.grade_propose}</span>
                          <TrendingUp size={11} className="text-green-400" />
                        </div>
                      </td>
                      <td><span className="text-xs text-[#8fa88f]">{p.anciennete} ans</span></td>
                      <td><span className="text-xs text-[#8fa88f]">{p.recommande_par}</span></td>
                      <td>
                        <Badge
                          label={p.statut === 'en_cours' ? 'En cours' : p.statut === 'approuve' ? 'Approuvé' : 'En attente'}
                          variant={p.statut === 'approuve' ? 'actif' : p.statut === 'en_attente' ? 'en_attente' : 'mission'}
                          dot
                        />
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {p.statut === 'en_cours' && (
                            <>
                              <button type="button" className="px-2 py-1 rounded-md text-[10px] bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors">Approuver</button>
                              <button type="button" className="px-2 py-1 rounded-md text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors">Refuser</button>
                            </>
                          )}
                          {p.statut !== 'en_cours' && (
                            <button type="button" className="px-2 py-1 rounded-md text-[10px] bg-[#1a261a] text-[#8fa88f] border border-[#1e321e] hover:text-[#e8f0e8] transition-colors">Voir</button>
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
      </div>

      {/* Grade Detail Modal */}
      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.nom}
          subtitle={`${selected.abreviation} · Force : ${selected.force}`}
          size="md"
          footer={<button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Award size={28} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-[#e8f0e8]">{selected.nom}</h3>
                <p className="text-xs text-[#8fa88f]">{selected.abreviation}</p>
                <Badge label={categorieLabels[selected.categorie] ?? selected.categorie} variant="mission" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Niveau hiérarchique', selected.niveauHierarchique?.toString() ?? '—'],
                ['Force', selected.force],
                ['Salaire de base', selected.salaireBase ? `${selected.salaireBase.toLocaleString()} USD` : '—'],
                ['Indemnité commandement', selected.indemniteCommandement ? `${selected.indemniteCommandement.toLocaleString()} USD` : '—'],
                ['Code', selected.code],
                ['Statut', selected.actif ? 'Actif' : 'Inactif'],
              ].map(([label, value]) => (
                <div key={label} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-sm font-semibold text-[#e8f0e8]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
