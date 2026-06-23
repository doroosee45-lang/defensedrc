'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Target, Truck, Bell, Shield, TrendingUp, Activity,
  MapPin, AlertTriangle, Clock, Zap, BarChart2, Flag, Eye, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts';
// Recharts Line/LineChart non utilisés dans cette vue — omis intentionnellement
import Header from '@/components/layout/Header';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import rapportsService, { type DashboardStats } from '@/services/rapports.service';
import alertesService, { type Alerte } from '@/services/alertes.service';
import operationsService, { type Mission } from '@/services/operations.service';

// Données statiques (graphiques) issues du mock tant que l'API ne les fournit pas
import { effectifsParProvince, missionsParMois, statutPersonnel } from '@/data/mockData';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#141e14] border border-[#1e321e] rounded-lg px-3 py-2 text-xs">
        <p className="text-[#8fa88f] mb-1">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {Number(p.value).toLocaleString('fr-FR')}</p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, alertesRes, missionsRes] = await Promise.allSettled([
        rapportsService.getDashboard(),
        alertesService.getActives({ niveau: undefined }),
        operationsService.getAll({ statut: 'en_cours', limit: 4 }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data ?? null);
      if (alertesRes.status === 'fulfilled') setAlertes((alertesRes.value.data as Alerte[]) ?? []);
      if (missionsRes.status === 'fulfilled') setMissions((missionsRes.value.data as Mission[]) ?? []);
      setLastUpdate(new Date());
    } catch { /* Fallback: données déjà en place */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const criticalAlerts = alertes.filter(a => a.niveau === 'critique');
  const activeMissions = missions.slice(0, 4);

  // Données dérivées pour les graphiques (piChart du statut personnel)
  const pieData = stats
    ? [
        { name: 'Actifs', value: stats.personnel.actif },
        { name: 'En mission', value: stats.personnel.enMission },
        { name: 'En formation', value: stats.personnel.enFormation },
        { name: 'Autres', value: Math.max(0, stats.personnel.total - stats.personnel.actif - stats.personnel.enMission - stats.personnel.enFormation) },
      ]
    : statutPersonnel;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tableau de bord national"
        subtitle="Centre de commandement FARDC — Mise à jour en temps réel"
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">

        {/* Status Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141e14] border border-[#1e321e] rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 status-live" />
            <span className="text-xs text-[#8fa88f]">Système opérationnel</span>
          </div>
          {criticalAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-xs text-red-400 font-medium">{criticalAlerts.length} alerte{criticalAlerts.length > 1 ? 's' : ''} critique{criticalAlerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141e14] border border-[#1e321e] rounded-lg ml-auto">
            <Clock size={12} className="text-[#5a705a]" />
            <span className="text-xs text-[#5a705a]">Dernière MAJ : {lastUpdate.toLocaleTimeString('fr-FR')}</span>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="text-[#5a705a] hover:text-green-400 transition-colors disabled:opacity-40"
              title="Actualiser"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            title="Effectif total FARDC"
            value={stats?.personnel.total ?? '—'}
            subtitle={`${(stats?.personnel.actif ?? 0).toLocaleString('fr-FR')} actifs`}
            icon={<Users size={20} />}
            color="green"
            trend={{ value: 2.3, label: 'vs mois dernier' }}
          />
          <StatCard
            title="En mission active"
            value={stats?.personnel.enMission ?? '—'}
            subtitle={`${stats?.operations.actives ?? 0} missions en cours`}
            icon={<Target size={20} />}
            color="blue"
          />
          <StatCard
            title="Véhicules opérationnels"
            value={stats?.vehicules.disponibles ?? '—'}
            subtitle={`${stats?.vehicules.tauxDisponibilite ?? 0}% disponibilité`}
            icon={<Truck size={20} />}
            color="yellow"
          />
          <StatCard
            title="Alertes actives"
            value={stats?.alertes.critiques ?? criticalAlerts.length}
            subtitle="Critique — Action requise"
            icon={<Bell size={20} />}
            color="red"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="En formation" value={stats?.personnel.enFormation ?? '—'} icon={<Shield size={16} />} color="purple" size="sm" />
          <StatCard title="Véhicules total" value={stats?.vehicules.total ?? '—'} icon={<Truck size={16} />} color="yellow" size="sm" />
          <StatCard title="Alertes totales" value={stats?.alertes.total ?? alertes.length} icon={<Activity size={16} />} color="red" size="sm" />
          <StatCard title="Opérations en cours" value={stats?.operations.actives ?? '—'} icon={<Zap size={16} />} color="gray" size="sm" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#e8f0e8]">Effectifs par province</h3>
                <p className="text-xs text-[#5a705a]">Répartition du personnel militaire</p>
              </div>
              <BarChart2 size={16} className="text-[#5a705a]" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={effectifsParProvince} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e321e" />
                <XAxis dataKey="province" tick={{ fill: '#5a705a', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#5a705a', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="effectif" fill="#22c55e" radius={[3, 3, 0, 0]} name="Effectif" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#e8f0e8] mb-4">Statut du personnel</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 4).map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10px] text-[#8fa88f]">{s.name}</span>
                  </div>
                  <span className="text-[10px] text-[#e8f0e8] font-medium">{Number(s.value).toLocaleString('fr-FR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Missions trend */}
        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#e8f0e8]">Missions — Évolution mensuelle</h3>
              <p className="text-xs text-[#5a705a]">Missions lancées vs terminées sur les 6 derniers mois</p>
            </div>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={missionsParMois}>
              <defs>
                <linearGradient id="missionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="termineesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e321e" />
              <XAxis dataKey="mois" tick={{ fill: '#5a705a', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#5a705a', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="missions" stroke="#3b82f6" fill="url(#missionsGrad)" strokeWidth={2} name="Lancées" />
              <Area type="monotone" dataKey="terminées" stroke="#22c55e" fill="url(#termineesGrad)" strokeWidth={2} name="Terminées" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Operations & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Active Missions */}
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-blue-400" />
                <span className="text-sm font-semibold text-[#e8f0e8]">Missions actives</span>
                <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.5 rounded-full">{activeMissions.length}</span>
              </div>
              <a href="/dashboard/operations" className="text-xs text-green-400 hover:text-green-300">Voir tout →</a>
            </div>
            <div className="divide-y divide-[#1e321e]/50">
              {activeMissions.length === 0 && !loading && (
                <div className="px-4 py-6 text-center text-xs text-[#5a705a]">Aucune mission active</div>
              )}
              {activeMissions.map(m => (
                <div key={m._id} className="px-4 py-3 hover:bg-[#1a261a] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-[#5a705a] font-mono">{m.code}</span>
                        <Badge
                          label={m.priorite}
                          variant={m.priorite === 'normale' ? 'disponible' : m.priorite as 'haute' | 'basse' | 'critique'}
                          size="xs"
                        />
                      </div>
                      <p className="text-xs font-medium text-[#e8f0e8] truncate">{m.nom}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {m.zoneOperation?.province && (
                          <div className="flex items-center gap-1 text-[10px] text-[#5a705a]">
                            <MapPin size={10} />{m.zoneOperation.province}
                          </div>
                        )}
                        {typeof m.personnelAssigne !== 'undefined' && (
                          <div className="flex items-center gap-1 text-[10px] text-[#5a705a]">
                            <Users size={10} />{m.personnelAssigne.length} pers.
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge label="En cours" variant="en_cours" size="xs" dot />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-[#141e14] border border-[#1e321e] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-red-400" />
                <span className="text-sm font-semibold text-[#e8f0e8]">Alertes récentes</span>
                {criticalAlerts.length > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{criticalAlerts.length} critiques</span>
                )}
              </div>
              <a href="/dashboard/alertes" className="text-xs text-green-400 hover:text-green-300">Voir tout →</a>
            </div>
            <div className="divide-y divide-[#1e321e]/50">
              {alertes.length === 0 && !loading && (
                <div className="px-4 py-6 text-center text-xs text-[#5a705a]">Aucune alerte active</div>
              )}
              {alertes.slice(0, 4).map(a => {
                const borderColor = a.niveau === 'critique' ? 'border-l-red-500' : a.niveau === 'haute' ? 'border-l-orange-500' : 'border-l-yellow-500';
                const dotColor = a.niveau === 'critique' ? 'bg-red-400' : a.niveau === 'haute' ? 'bg-orange-400' : 'bg-yellow-400';
                return (
                  <div key={a._id} className={`px-4 py-3 border-l-2 ${borderColor} hover:bg-[#1a261a] transition-colors`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor} ${a.statut === 'active' ? 'status-live' : ''}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge label={a.niveau} variant={a.niveau as 'critique' | 'haute' | 'moyenne' | 'basse'} size="xs" />
                        </div>
                        <p className="text-xs font-medium text-[#e8f0e8] truncate">{a.titre}</p>
                        <p className="text-[10px] text-[#5a705a] mt-0.5 line-clamp-1">{a.description}</p>
                        <p className="text-[9px] text-[#3a503a] mt-0.5">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString('fr-FR') : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick stats footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Régions militaires', value: '4', icon: <Flag size={14} />, color: 'text-green-400' },
            { label: 'Brigades actives', value: String(stats?.operations.parType?.length ?? 12), icon: <Shield size={14} />, color: 'text-blue-400' },
            { label: 'Bases militaires', value: '38', icon: <MapPin size={14} />, color: 'text-yellow-400' },
            { label: 'Véhicules total', value: String(stats?.vehicules.total ?? '—'), icon: <Eye size={14} />, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#141e14] border border-[#1e321e] rounded-xl p-3 flex items-center gap-3">
              <div className={s.color}>{s.icon}</div>
              <div>
                <div className="text-sm font-bold text-[#e8f0e8]">{s.value}</div>
                <div className="text-[10px] text-[#5a705a]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
