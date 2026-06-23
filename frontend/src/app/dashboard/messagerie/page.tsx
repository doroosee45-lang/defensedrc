'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Inbox, AlertTriangle, Plus, Eye, Archive } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import messagerieService, { type Message } from '@/services/messagerie.service'
import { clsx } from 'clsx'

const prioriteConfig: Record<string, { label: string; color: string }> = {
  critique: { label: 'Critique', color: 'text-red-400' },
  haute:    { label: 'Haute',    color: 'text-orange-400' },
  normale:  { label: 'Normale',  color: 'text-[#8fa88f]' },
  basse:    { label: 'Basse',    color: 'text-[#5a705a]' },
}

function expediteurLabel(e: Message['expediteur']): string {
  if (!e) return '—'
  if (typeof e === 'object') return `${e.nom} ${e.prenom}`
  return String(e)
}

export default function MessageriePage() {
  const [inbox, setInbox] = useState<Message[]>([])
  const [sent, setSent] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  const [selected, setSelected] = useState<Message | null>(null)
  const [nonLus, setNonLus] = useState(0)

  useEffect(() => {
    Promise.all([
      messagerieService.getInbox({ limit: 100 }),
      messagerieService.getSent({ limit: 50 }),
      messagerieService.getNonLus(),
    ])
      .then(([inboxRes, sentRes, nlRes]) => {
        setInbox((inboxRes.data as Message[]) ?? [])
        setSent((sentRes.data as Message[]) ?? [])
        setNonLus((nlRes.data as { count: number })?.count ?? 0)
      })
      .catch(() => {
        import('@/data/mockData').then(({ messages: mock }) => {
          setInbox(mock as unknown as Message[])
        }).catch(() => {})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const messages = activeTab === 'inbox' ? inbox : sent
  const critiques = inbox.filter(m => m.priorite === 'critique').length

  async function handleArchive(msg: Message) {
    await messagerieService.archive(msg._id).catch(() => {})
    setInbox(prev => prev.filter(m => m._id !== msg._id))
    setSelected(null)
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Messagerie sécurisée" subtitle="Communications chiffrées FARDC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="Messages reçus" value={isLoading ? '…' : inbox.length} icon={<Inbox size={16} />} color="green" size="sm" />
          <StatCard title="Non lus" value={isLoading ? '…' : nonLus} icon={<Mail size={16} />} color="blue" size="sm" />
          <StatCard title="Critiques" value={isLoading ? '…' : critiques} icon={<AlertTriangle size={16} />} color="red" size="sm" />
          <StatCard title="Envoyés" value={isLoading ? '…' : sent.length} icon={<Send size={16} />} color="green" size="sm" />
        </div>

        <div className="bg-[#141e14] border border-[#1e321e] rounded-xl">
          <div className="px-4 py-3 border-b border-[#1e321e] flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {(['inbox', 'sent'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1',
                    activeTab === tab
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'text-[#5a705a] hover:text-[#e8f0e8]'
                  )}
                >
                  {tab === 'inbox' ? <><Inbox size={12} /> Boîte de réception</> : <><Send size={12} /> Envoyés</>}
                </button>
              ))}
              {isLoading && <div className="w-4 h-4 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />}
            </div>
            <button type="button" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <Plus size={13} />
              Nouveau message
            </button>
          </div>

          <div className="divide-y divide-[#1e321e]">
            {messages.map(msg => {
              const pCfg = prioriteConfig[msg.priorite] ?? prioriteConfig.normale
              return (
                <button
                  key={msg._id}
                  type="button"
                  onClick={() => setSelected(msg)}
                  className={clsx(
                    'w-full px-4 py-3 text-left hover:bg-[#1a261a] transition-all',
                    !msg.isLu && activeTab === 'inbox' && 'border-l-2 border-l-green-500'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!msg.isLu && activeTab === 'inbox' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        )}
                        <span className={clsx('text-xs font-semibold truncate', !msg.isLu ? 'text-[#e8f0e8]' : 'text-[#8fa88f]')}>
                          {msg.sujet}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#5a705a] truncate">
                        {activeTab === 'inbox' ? `De: ${expediteurLabel(msg.expediteur)}` : `À: ${msg.destinataires?.map(d => `${d.nom} ${d.prenom}`).join(', ') ?? msg.typeDestinataire}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={clsx('text-[10px] font-medium', pCfg.color)}>{pCfg.label}</span>
                      {msg.classification && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                          {msg.classification}
                        </span>
                      )}
                      <span className="text-[10px] text-[#5a705a]">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('fr-FR') : ''}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
            {!isLoading && messages.length === 0 && (
              <div className="text-center py-12 text-xs text-[#5a705a]">Aucun message</div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <Modal
          isOpen
          onClose={() => setSelected(null)}
          title={selected.sujet}
          subtitle={`${expediteurLabel(selected.expediteur)} · ${selected.createdAt ? new Date(selected.createdAt).toLocaleString('fr-FR') : ''}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              {activeTab === 'inbox' && (
                <button
                  type="button"
                  className="btn-secondary text-xs flex items-center gap-1.5"
                  onClick={() => handleArchive(selected)}
                >
                  <Archive size={12} />
                  Archiver
                </button>
              )}
              <button type="button" className="btn-secondary text-xs" onClick={() => setSelected(null)}>Fermer</button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['De', expediteurLabel(selected.expediteur)],
                ['Priorité', prioriteConfig[selected.priorite]?.label ?? selected.priorite],
                ['Type', selected.type],
                ['Classification', selected.classification ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                  <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-1">{l}</div>
                  <div className="text-xs font-semibold text-[#e8f0e8]">{v}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-[#0a110a] rounded-xl border border-[#1e321e]">
              <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Eye size={10} />
                Contenu
                {selected.contenuChiffre && <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">Chiffré</span>}
              </div>
              <div className="text-sm text-[#e8f0e8] leading-relaxed whitespace-pre-wrap">{selected.contenu}</div>
            </div>
            {selected.pieceJointes && selected.pieceJointes.length > 0 && (
              <div className="p-3 bg-[#0a110a] rounded-xl border border-[#1e321e]">
                <div className="text-[10px] text-[#5a705a] uppercase tracking-wider mb-2">Pièces jointes</div>
                <div className="space-y-1">
                  {selected.pieceJointes.map((pj, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[#e8f0e8]">{pj.nom}</span>
                      <span className="text-[10px] text-[#5a705a]">{(pj.taille / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
