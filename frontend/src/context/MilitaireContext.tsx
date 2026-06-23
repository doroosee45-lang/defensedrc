'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import personnelService from '@/services/personnel.service';
import type { Militaire } from '@/services/personnel.service';

interface MilitaireCtx {
  militaires: Militaire[];
  total: number;
  isLoading: boolean;
  error: string | null;
  addMilitaire: (m: Partial<Militaire>) => Promise<void>;
  updateMilitaire: (id: string, patch: Partial<Militaire>) => Promise<void>;
  deleteMilitaire: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<MilitaireCtx | null>(null);

export function MilitaireProvider({ children }: { children: React.ReactNode }) {
  const [militaires, setMilitaires] = useState<Militaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await personnelService.getAll({ limit: 200 });
      setMilitaires((res.data as Militaire[]) ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur chargement personnel';
      setError(msg);
      // Fallback sur mock data si le backend est indisponible
      try {
        const { militaires: mockData } = await import('@/data/mockData');
        setMilitaires(mockData as unknown as Militaire[]);
      } catch { /* ignore */ }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addMilitaire = useCallback(async (data: Partial<Militaire>) => {
    const res = await personnelService.create(data);
    const created = res.data as Militaire;
    if (created) setMilitaires(prev => [created, ...prev]);
  }, []);

  const updateMilitaire = useCallback(async (id: string, patch: Partial<Militaire>) => {
    const res = await personnelService.update(id, patch);
    const updated = res.data as Militaire;
    if (updated) setMilitaires(prev => prev.map(m => (m._id === id ? updated : m)));
  }, []);

  const deleteMilitaire = useCallback(async (id: string) => {
    await personnelService.delete(id);
    setMilitaires(prev => prev.filter(m => m._id !== id));
  }, []);

  const value = useMemo<MilitaireCtx>(
    () => ({ militaires, total: militaires.length, isLoading, error, addMilitaire, updateMilitaire, deleteMilitaire, reload: fetchAll }),
    [militaires, isLoading, error, addMilitaire, updateMilitaire, deleteMilitaire, fetchAll]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('MilitaireContext non trouvé — wrappez avec <MilitaireProvider>');
  return ctx;
}

export const useMilitaires = () => useCtx().militaires;
export const useAddMilitaire = () => useCtx().addMilitaire;
export const useUpdateMilitaire = () => useCtx().updateMilitaire;
export const useDeleteMilitaire = () => useCtx().deleteMilitaire;
export const useMilitaireContext = () => useCtx();
