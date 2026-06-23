'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  footer?: React.ReactNode
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
}

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx(
        'relative w-full bg-[#0f1a0f] border border-[#1e321e] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]',
        sizeMap[size]
      )}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#1e321e] flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-[#e8f0e8]">{title}</h3>
            {subtitle && <p className="text-xs text-[#5a705a] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5a705a] hover:text-[#e8f0e8] hover:bg-[#1a261a] transition-all flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#1e321e] flex items-center justify-end gap-3 flex-shrink-0 bg-[#0a110a] rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
