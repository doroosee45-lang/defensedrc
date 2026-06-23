import { clsx } from 'clsx'

type ColorKey = 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'gray' | 'orange'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  color?: ColorKey
  size?: 'sm' | 'md' | 'lg'
}

const colorMap: Record<ColorKey, { icon: string; value: string; border: string }> = {
  green: {
    icon: 'bg-green-500/10 text-green-400',
    value: 'text-green-400',
    border: 'border-green-500/20',
  },
  blue: {
    icon: 'bg-blue-500/10 text-blue-400',
    value: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  red: {
    icon: 'bg-red-500/10 text-red-400',
    value: 'text-red-400',
    border: 'border-red-500/20',
  },
  yellow: {
    icon: 'bg-yellow-500/10 text-yellow-400',
    value: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
  purple: {
    icon: 'bg-purple-500/10 text-purple-400',
    value: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  gray: {
    icon: 'bg-gray-500/10 text-gray-400',
    value: 'text-gray-300',
    border: 'border-gray-500/20',
  },
  orange: {
    icon: 'bg-orange-500/10 text-orange-400',
    value: 'text-orange-400',
    border: 'border-orange-500/20',
  },
}

export default function StatCard({ title, value, subtitle, icon, trend, color = 'green', size = 'md' }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className={clsx(
      'bg-[#141e14] border rounded-xl card-hover',
      c.border,
      size === 'sm' ? 'p-3' : size === 'lg' ? 'p-6' : 'p-4'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={clsx('text-[#8fa88f] font-medium truncate', size === 'sm' ? 'text-[10px]' : 'text-xs')}>{title}</p>
          <p className={clsx('font-bold mt-1', c.value, size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl')}>
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-[#5a705a] mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className={clsx('flex items-center gap-1 mt-1.5', trend.value >= 0 ? 'text-green-400' : 'text-red-400')}>
              <span className="text-[10px] font-medium">{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-[10px] text-[#5a705a]">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={clsx('rounded-xl flex items-center justify-center flex-shrink-0', c.icon, size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10')}>
          {icon}
        </div>
      </div>
    </div>
  )
}
