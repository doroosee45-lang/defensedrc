'use client'

import { useState } from 'react'
import { Bot, TrendingUp, AlertTriangle, Cpu, Shield, Activity, Zap, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'

const iaFeatures = [
  {
    id: 'anomalies',
    titre: 'Détection d\'anomalies',
    description: 'Analyse les patterns de comportement pour détecter des activités inhabituelles.',
    statut: 'actif',
    icon: <AlertTriangle size={20} />,
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    insights: [
      { type: 'alerte', text: '1 adresse IP suspecte bloquée ce matin (41.243.12.54)', niveau: 'critique' },
      { type: 'info', text: 'Comportement de connexion normal pour 99.8% des utilisateurs', niveau: 'info' },
    ],
  },
  {
    id: 'logistique',
    titre: 'Prévision logistique',
    description: 'Anticipe les besoins en munitions, carburant et équipements selon les opérations planifiées.',
    statut: 'actif',
    icon: <TrendingUp size={20} />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    insights: [
      { type: 'alerte', text: 'Stock munitions BTN-1011 atteindra 0% dans 6 jours au rythme actuel', niveau: 'haute' },
      { type: 'info', text: 'Besoins carburant RM-EST : +18% pour les 30 prochains jours', niveau: 'moyenne' },
      { type: 'ok', text: 'Stock médicaments suffisant pour 45 jours d\'opérations', niveau: 'info' },
    ],
  },
  {
    id: 'rapports',
    titre: 'Génération de rapports automatiques',
    description: 'Rédaction automatique des rapports d\'activité quotidiens et opérationnels.',
    statut: 'actif',
    icon: <Cpu size={20} />,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
    insights: [
      { type: 'ok', text: 'Rapport quotidien RM-EST généré à 06h00', niveau: 'info' },
      { type: 'ok', text: 'Rapport financier mensuel prêt à valider', niveau: 'info' },
    ],
  },
  {
    id: 'maintenance',
    titre: 'Prédiction de maintenance',
    description: 'Anticipe les pannes de véhicules et équipements selon l\'historique d\'utilisation.',
    statut: 'actif',
    icon: <Activity size={20} />,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    insights: [
      { type: 'alerte', text: 'BTR-80 FARDC-BLD-001 : probabilité de panne moteur 34% dans 30 jours', niveau: 'moyenne' },
      { type: 'alerte', text: '8 véhicules BTN-1012 dépassent le kilométrage préventif', niveau: 'haute' },
      { type: 'ok', text: 'Flotte RM-OUEST en bon état général', niveau: 'info' },
    ],
  },
  {
    id: 'ressources',
    titre: 'Planification des ressources',
    description: 'Recommandations d\'allocation du personnel et des équipements aux missions.',
    statut: 'beta',
    icon: <Zap size={20} />,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    insights: [
      { type: 'info', text: 'Recommandation : renforcer BTN-1011 de 150 hommes pour l\'OP BOUCLIER', niveau: 'haute' },
      { type: 'info', text: 'Suggestion : réaffecter 2 blindés BTN-1012 → BTN-1011', niveau: 'moyenne' },
    ],
  },
  {
    id: 'deplacements',
    titre: 'Analyse des déplacements GPS',
    description: 'Détection de trajets anormaux ou de sorties de zone non autorisées.',
    statut: 'actif',
    icon: <Shield size={20} />,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    insights: [
      { type: 'alerte', text: 'FARDC-BLD-009 a franchi le périmètre autorisé à 11h45', niveau: 'haute' },
      { type: 'ok', text: 'Tous les autres véhicules dans les zones autorisées', niveau: 'info' },
    ],
  },
]

export default function IAPage() {
  const [selected, setSelected] = useState<string | null>('anomalies')

  const selectedFeature = iaFeatures.find(f => f.id === selected)

  const insightColor = (niveau: string) => {
    switch (niveau) {
      case 'critique': return 'border-l-red-500 bg-red-500/5 text-red-400'
      case 'haute': return 'border-l-orange-500 bg-orange-500/5 text-orange-400'
      case 'moyenne': return 'border-l-yellow-500 bg-yellow-500/5 text-yellow-400'
      default: return 'border-l-green-500 bg-green-500/5 text-green-400'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Module Intelligence Artificielle" subtitle="Aide à la décision — Usage humain requis pour toute action" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Ethics notice */}
        <div className="p-4 bg-[#0f1a0f] border border-[#1e321e] rounded-xl">
          <div className="flex items-start gap-3">
            <Bot size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-[#e8f0e8] mb-1">Charte d'utilisation de l'IA — MILSYS RDC</h3>
              <div className="space-y-1">
                {[
                  "L'IA est un outil d'AIDE À LA DÉCISION. Toute action significative reste sous contrôle humain.",
                  "Les recommandations sont explicables et traçables. Chaque suggestion affiche ses sources.",
                  "L'IA n'accède pas aux données médicales ou disciplinaires pour le profilage.",
                  "Les biais algorithmiques font l'objet d'un suivi régulier et d'une correction systématique.",
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-500 text-[11px] mt-0.5">✓</span>
                    <span className="text-[11px] text-[#8fa88f]">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IA modules grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {iaFeatures.map(f => (
            <button
              key={f.id}
              onClick={() => setSelected(f.id)}
              className={`p-4 border rounded-xl text-left transition-all ${
                selected === f.id
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-[#1e321e] bg-[#141e14] hover:border-green-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${f.color}`}>
                  {f.icon}
                </div>
                {f.statut === 'beta' ? (
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full font-medium">BÊTA</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-live" />
                    <span className="text-[9px] text-green-400">Actif</span>
                  </div>
                )}
              </div>
              <h4 className="text-xs font-semibold text-[#e8f0e8] mb-1">{f.titre}</h4>
              <p className="text-[10px] text-[#5a705a] leading-relaxed">{f.description}</p>
              <div className="mt-2 text-[10px] text-green-400 flex items-center gap-1">
                {f.insights.length} insight{f.insights.length > 1 ? 's' : ''} <ChevronRight size={11} />
              </div>
            </button>
          ))}
        </div>

        {/* Selected module details */}
        {selectedFeature && (
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedFeature.color}`}>
                {selectedFeature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#e8f0e8]">{selectedFeature.titre}</h3>
                <p className="text-xs text-[#5a705a]">{selectedFeature.description}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Cpu size={10} />
                Insights & Recommandations IA
              </div>
              {selectedFeature.insights.map((insight, i) => (
                <div key={i} className={`border border-l-4 rounded-xl px-4 py-3 ${insightColor(insight.niveau)}`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge label={insight.niveau} variant={insight.niveau as any} size="xs" />
                        <span className="text-[9px] text-[#5a705a]">Confiance : 87%</span>
                      </div>
                      <p className="text-xs text-[#e8f0e8]">{insight.text}</p>
                    </div>
                    <button className="text-xs text-green-400 hover:text-green-300 whitespace-nowrap transition-colors">Détails →</button>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 bg-[#0f1a0f] border border-[#1e321e] rounded-xl flex items-center gap-3">
                <Bot size={14} className="text-green-400" />
                <p className="text-[10px] text-[#5a705a] leading-relaxed flex-1">
                  Ces recommandations sont générées automatiquement par analyse des données MILSYS RDC.
                  Elles sont consultatives et nécessitent validation humaine avant toute action.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
