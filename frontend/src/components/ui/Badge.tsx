import { clsx } from 'clsx'

type BadgeVariant = 'actif' | 'mission' | 'formation' | 'permission' | 'retraite' | 'blesse' | 'suspendu' |
  'planifiee' | 'en_cours' | 'terminee' | 'annulee' | 'suspendue' |
  'operationnel' | 'maintenance' | 'hs' | 'en_reparation' |
  'disponible' | 'attribue' | 'perdu' |
  'approuve' | 'refuse' | 'en_attente' |
  'calcule' | 'valide' | 'paye' | 'litige' |
  'critique' | 'haute' | 'moyenne' | 'basse' | 'info' |
  'brouillon' | 'en_validation' | 'archive' |
  'custom'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  dot?: boolean
  size?: 'xs' | 'sm'
  className?: string
}

const variantMap: Record<string, string> = {
  actif: 'bg-green-500/15 text-green-400 border border-green-500/30',
  mission: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  en_mission: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  formation: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  en_formation: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  permission: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  en_permission: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  retraite: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  blesse: 'bg-red-500/15 text-red-400 border border-red-500/30',
  suspendu: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  planifiee: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  en_cours: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  terminee: 'bg-green-500/15 text-green-400 border border-green-500/30',
  annulee: 'bg-red-500/15 text-red-400 border border-red-500/30',
  suspendue: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  operationnel: 'bg-green-500/15 text-green-400 border border-green-500/30',
  maintenance: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  hs: 'bg-red-500/15 text-red-400 border border-red-500/30',
  en_reparation: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  disponible: 'bg-green-500/15 text-green-400 border border-green-500/30',
  attribue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  perdu: 'bg-red-500/15 text-red-400 border border-red-500/30',
  hors_service: 'bg-red-500/15 text-red-400 border border-red-500/30',
  approuve: 'bg-green-500/15 text-green-400 border border-green-500/30',
  refuse: 'bg-red-500/15 text-red-400 border border-red-500/30',
  en_attente: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  calcule: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  valide: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  paye: 'bg-green-500/15 text-green-400 border border-green-500/30',
  litige: 'bg-red-500/15 text-red-400 border border-red-500/30',
  critique: 'bg-red-500/15 text-red-400 border border-red-500/30',
  haute: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  moyenne: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  basse: 'bg-green-500/15 text-green-400 border border-green-500/30',
  info: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  brouillon: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  en_validation: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  archive: 'bg-gray-500/15 text-gray-400 border border-gray-500/30',
  custom: 'bg-gray-500/15 text-gray-300 border border-gray-500/30',
}

const dotMap: Record<string, string> = {
  actif: 'bg-green-400',
  en_cours: 'bg-blue-400',
  terminee: 'bg-green-400',
  operationnel: 'bg-green-400',
  disponible: 'bg-green-400',
  approuve: 'bg-green-400',
  paye: 'bg-green-400',
  blesse: 'bg-red-400',
  annulee: 'bg-red-400',
  hs: 'bg-red-400',
  refuse: 'bg-red-400',
  litige: 'bg-red-400',
  critique: 'bg-red-400',
  maintenance: 'bg-yellow-400',
  en_attente: 'bg-yellow-400',
  en_permission: 'bg-yellow-400',
  haute: 'bg-orange-400',
  mission: 'bg-blue-400',
  en_mission: 'bg-blue-400',
}

export default function Badge({ label, variant = 'custom', dot = false, size = 'sm', className }: BadgeProps) {
  const cls = variantMap[variant] || variantMap.custom

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full font-medium',
      size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
      cls,
      className
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotMap[variant] || 'bg-gray-400')} />}
      {label}
    </span>
  )
}
