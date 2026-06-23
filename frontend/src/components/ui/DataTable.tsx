'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { clsx } from 'clsx'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (val: string) => void
  pageSize?: number
  actions?: (row: T) => React.ReactNode
  emptyMessage?: string
  toolbar?: React.ReactNode
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  onSearch,
  pageSize = 10,
  actions,
  emptyMessage = 'Aucun résultat',
  toolbar,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
    onSearch?.(val)
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let filtered = [...data]
  if (search && !onSearch) {
    const s = search.toLowerCase()
    filtered = filtered.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(s))
    )
  }

  if (sortKey) {
    filtered.sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      const cmp = String(va).localeCompare(String(vb), 'fr')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  const total = filtered.length
  const pages = Math.ceil(total / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      {(searchable || toolbar) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchable && (
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a705a]" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="w-full bg-[#0f1a0f] border border-[#1e321e] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e8f0e8] placeholder-[#5a705a] focus:outline-none focus:border-green-500/50 transition-all"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {/* Table */}
      <div className="border border-[#1e321e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full mil-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={clsx(col.sortable && 'cursor-pointer select-none hover:text-[#e8f0e8] transition-colors')}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        <span className="text-green-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="text-center text-[#5a705a] py-12 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    {actions && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#5a705a]">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} sur {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-[#5a705a] hover:text-[#e8f0e8] hover:bg-[#1a261a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let p = i + 1
              if (pages > 5) {
                if (page > 3) p = page - 2 + i
                if (p > pages) p = pages - (4 - i)
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    'w-7 h-7 rounded-lg text-xs font-medium transition-all',
                    p === page
                      ? 'bg-green-600 text-white'
                      : 'text-[#5a705a] hover:text-[#e8f0e8] hover:bg-[#1a261a]'
                  )}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-1.5 rounded-lg text-[#5a705a] hover:text-[#e8f0e8] hover:bg-[#1a261a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {total > 0 && total <= pageSize && (
        <div className="text-xs text-[#5a705a] px-1">{total} résultat{total > 1 ? 's' : ''}</div>
      )}
    </div>
  )
}
