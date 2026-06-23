'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, FileText, TrendingUp, Users, Target, Truck, DollarSign } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import Header from '@/components/layout/Header'
import rapportsService, { type DashboardStats } from '@/services/rapports.service'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#141e14] border border-[#1e321e] rounded-lg px-3 py-2 text-xs">
        <p className="text-[#8fa88f] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString?.('fr-FR') ?? p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const radarData = [
  { subject: 'Effectifs', A: 85, fullMark: 100 },
  { subject: 'Opérations', A: 92, fullMark: 100 },
  { subject: 'Équipements', A: 71, fullMark: 100 },
  { subject: 'Véhicules', A: 78, fullMark: 100 },
  { subject: 'Formation', A: 63, fullMark: 100 },
  { subject: 'Logistique', A: 82, fullMark: 100 },
]

const reportTypes = [
  { id: 'effectifs', label: 'Rapport des effectifs', icon: <Users size={16} />, description: 'Situation des effectifs par province, grade et statut', frequence: 'Quotidien', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { id: 'operations', label: 'Rapport opérationnel', icon: <Target size={16} />, description: 'Bilan des missions actives et terminées', frequence: 'Quotidien', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'logistique', label: 'Rapport logistique', icon: <Truck size={16} />, description: 'État des véhicules, équipements et stocks', frequence: 'Hebdomadaire', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'financier', label: 'Rapport financier', icon: <DollarSign size={16} />, description: 'Masse salariale et paiements du mois', frequence: 'Mensuel', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'disciplinaire', label: 'Rapport disciplinaire', icon: <FileText size={16} />, description: 'Incidents disciplinaires et distinctions', frequence: 'Mensuel', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { id: 'annuel', label: 'Rapport annuel', icon: <BarChart3 size={16} />, description: 'Synthèse annuelle complète des FARDC', frequence: 'Annuel', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
]

const FORCE_LABELS: Record<string, string> = {
  terrestre: 'Terrestre', aerienne: 'Aérienne', maritime: 'Maritime', emg: 'EMG',
}
const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

const FALLBACK_EFFECTIFS = [
  { province: 'Nord-Kivu', effectif: 8200 }, { province: 'Sud-Kivu', effectif: 6100 },
  { province: 'Ituri', effectif: 5300 }, { province: 'Kinshasa', effectif: 4900 },
  { province: 'Tanganyika', effectif: 3800 }, { province: 'Maniema', effectif: 2900 },
]
const FALLBACK_MISSIONS = [
  { mois: 'Jan', missions: 12, terminées: 10 }, { mois: 'Fév', missions: 18, terminées: 15 },
  { mois: 'Mar', missions: 14, terminées: 13 }, { mois: 'Avr', missions: 22, terminées: 19 },
  { mois: 'Mai', missions: 16, terminées: 14 }, { mois: 'Jun', missions: 20, terminées: 17 },
]

export default function RapportsPage() {
  const [activeReport, setActiveReport] = useState('effectifs')
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    rapportsService.getDashboard().then(r => setStats(r.data as DashboardStats)).catch(() => {})
  }, [])

  const effectifsParForce = stats
    ? (stats.personnel.parForce ?? []).map(f => ({ province: FORCE_LABELS[f._id] ?? f._id, effectif: f.count }))
    : FALLBACK_EFFECTIFS

  const statutPersonnel = stats
    ? [
        { name: 'Actif', value: stats.personnel.actif, color: '#22c55e' },
        { name: 'En mission', value: stats.personnel.enMission, color: '#3b82f6' },
        { name: 'En formation', value: stats.personnel.enFormation, color: '#f59e0b' },
        { name: 'Autre', value: stats.personnel.total - stats.personnel.actif - stats.personnel.enMission - stats.personnel.enFormation, color: '#5a705a' },
      ].filter(s => s.value > 0)
    : [
        { name: 'Actif', value: 24800, color: '#22c55e' },
        { name: 'En mission', value: 3200, color: '#3b82f6' },
        { name: 'En formation', value: 1500, color: '#f59e0b' },
        { name: 'Autre', value: 2300, color: '#5a705a' },
      ]

  const vehiculesOpTotal = stats ? stats.vehicules.disponibles : 2850

  return (
    <div className="flex flex-col h-full">
      <Header title="Rapports & Statistiques" subtitle="Tableaux de bord analytiques · FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        {/* Report generation panel */}
        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#e8f0e8] mb-3">Générer un rapport</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reportTypes.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                className={`p-3 border rounded-xl text-left transition-all hover:border-green-500/30 ${
                  activeReport === r.id ? 'border-green-500/50 bg-green-500/5' : 'border-[#1e321e] bg-[#0f1a0f]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 border ${r.color}`}>
                  {r.icon}
                </div>
                <div className="text-xs font-medium text-[#e8f0e8] mb-0.5">{r.label}</div>
                <div className="text-[10px] text-[#5a705a]">{r.description}</div>
                <div className="text-[9px] text-[#3a503a] mt-1 uppercase tracking-wider">{r.frequence}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#5a705a]">Période du</label>
              <input type="date" defaultValue="2025-06-01" className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none" />
              <label className="text-xs text-[#5a705a]">au</label>
              <input type="date" defaultValue="2025-06-30" className="bg-[#0f1a0f] border border-[#1e321e] rounded-lg px-2 py-1.5 text-xs text-[#e8f0e8] focus:outline-none" />
            </div>
            <button className="btn-primary text-xs px-4 py-2 ml-auto">
              <Download size={13} />
              Générer & Exporter PDF
            </button>
            <button className="btn-secondary text-xs px-4 py-2">
              <Download size={13} />
              Excel
            </button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Effectifs par province */}
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8]">Effectifs par province</h3>
              <button className="p-1.5 text-[#5a705a] hover:text-[#e8f0e8]"><Download size={13} /></button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={effectifsParForce} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e321e" />
                <XAxis dataKey="province" tick={{ fill: '#5a705a', fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#5a705a', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="effectif" fill="#22c55e" radius={[3, 3, 0, 0]} name="Effectif" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Missions par mois */}
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8]">Missions — 6 derniers mois</h3>
              <button className="p-1.5 text-[#5a705a] hover:text-[#e8f0e8]"><Download size={13} /></button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={FALLBACK_MISSIONS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e321e" />
                <XAxis dataKey="mois" tick={{ fill: '#5a705a', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#5a705a', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="missions" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Lancées" />
                <Line type="monotone" dataKey="terminées" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Terminées" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Statut personnel donut */}
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8]">Répartition du personnel</h3>
              <button className="p-1.5 text-[#5a705a] hover:text-[#e8f0e8]"><Download size={13} /></button>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={statutPersonnel} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                    {statutPersonnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statutPersonnel.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                      <span className="text-[11px] text-[#8fa88f]">{s.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#e8f0e8]">{s.value.toLocaleString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#e8f0e8]">Indice de performance FARDC</h3>
              <button className="p-1.5 text-[#5a705a] hover:text-[#e8f0e8]"><Download size={13} /></button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e321e" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#5a705a', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI table */}
        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-[#e8f0e8] mb-3">Indicateurs clés de performance (KPI)</h3>
          <div className="overflow-x-auto">
            <table className="w-full mil-table">
              <thead>
                <tr>
                  <th>Indicateur</th>
                  <th>Valeur actuelle</th>
                  <th>Objectif</th>
                  <th>Progression</th>
                  <th>Tendance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Taux de présence (base)', valeur: '94.2%', objectif: '95%', pct: 94, trend: '+0.8%' },
                  { label: 'Véhicules opérationnels', valeur: `${vehiculesOpTotal}`, objectif: '3000', pct: 95, trend: '+2.1%' },
                  { label: 'Missions clôturées dans les délais', valeur: '87%', objectif: '90%', pct: 87, trend: '+1.2%' },
                  { label: 'Vaccinations à jour', valeur: '91%', objectif: '100%', pct: 91, trend: '-0.5%' },
                  { label: 'Taux de paiement soldes', valeur: '96.8%', objectif: '100%', pct: 97, trend: '+0.3%' },
                ].map((kpi) => (
                  <tr key={kpi.label}>
                    <td className="text-xs text-[#e8f0e8]">{kpi.label}</td>
                    <td className="text-xs font-bold text-green-400">{kpi.valeur}</td>
                    <td className="text-xs text-[#5a705a]">{kpi.objectif}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[#1e321e] rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${kpi.pct >= 90 ? 'bg-green-500' : kpi.pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${kpi.pct}%` }} />
                        </div>
                        <span className="text-[10px] text-[#5a705a]">{kpi.pct}%</span>
                      </div>
                    </td>
                    <td className={`text-xs font-medium ${kpi.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{kpi.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
