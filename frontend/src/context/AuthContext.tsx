'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import api, { tokenStorage } from '@/lib/apiClient';

export interface AuthUser {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  grade?: string;
  unite?: { _id: string; nom: string; code: string };
  photo?: string;
  mfaEnabled: boolean;
  actif: boolean;
  dernierLogin?: string;
  // Périmètre géographique d'accès
  scope?: {
    province?: string | null;
    territoire?: string | null;
    secteur?: string | null;
    perimetre?: 'national' | 'provincial' | 'territorial' | 'sectoriel' | null;
  } | null;
  permissions?: {
    lecture: boolean;
    ecriture: boolean;
    suppression: boolean;
    export: boolean;
    impression: boolean;
  };
}

// Auth endpoints return tokens at root level, not nested in `data`
interface AuthLoginRes {
  success: boolean;
  mfaRequired?: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
}

interface AuthTokenRes {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface AuthMeRes {
  success: boolean;
  user: AuthUser;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaPending: boolean;
  tempToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (matricule: string, password: string) => Promise<{ mfaRequired: boolean }>;
  verifyMFA: (otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  can: (permission: keyof AuthUser['permissions']) => boolean;
  isRole: (...roles: string[]) => boolean;
  nomComplet: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    mfaPending: false,
    tempToken: null,
  });

  // Restaurer la session depuis localStorage au démarrage
  useEffect(() => {
    const restore = async () => {
      const cachedUser = tokenStorage.getUser();
      const refreshToken = tokenStorage.getRefresh();

      if (cachedUser && refreshToken) {
        try {
          const res = (await api.post('/auth/refresh', { refreshToken })) as unknown as AuthTokenRes;
          tokenStorage.setAccess(res.accessToken);
          tokenStorage.setRefresh(res.refreshToken);
          tokenStorage.setUser(res.user || cachedUser);
          setState({ user: (res.user || cachedUser) as AuthUser, isAuthenticated: true, isLoading: false, mfaPending: false, tempToken: null });
        } catch {
          tokenStorage.clear();
          setState(s => ({ ...s, isLoading: false }));
        }
      } else {
        tokenStorage.clear();
        setState(s => ({ ...s, isLoading: false }));
      }
    };
    restore();
  }, []);

  const login = useCallback(async (matricule: string, password: string) => {
    const res = (await api.post('/auth/login', { matricule, password }, { skipAuth: true })) as unknown as AuthLoginRes;

    if (res.mfaRequired) {
      setState(s => ({ ...s, mfaPending: true, tempToken: res.tempToken ?? null }));
      return { mfaRequired: true };
    }

    tokenStorage.setAccess(res.accessToken!);
    tokenStorage.setRefresh(res.refreshToken!);
    tokenStorage.setUser(res.user!);
    setState({ user: res.user!, isAuthenticated: true, isLoading: false, mfaPending: false, tempToken: null });
    return { mfaRequired: false };
  }, []);

  const verifyMFA = useCallback(async (otpCode: string) => {
    if (!state.tempToken) throw new Error('Session MFA expirée. Recommencez la connexion.');

    const res = (await api.post('/auth/verify-mfa', { tempToken: state.tempToken, otpCode }, { skipAuth: true })) as unknown as AuthTokenRes;

    tokenStorage.setAccess(res.accessToken);
    tokenStorage.setRefresh(res.refreshToken);
    tokenStorage.setUser(res.user);
    setState({ user: res.user, isAuthenticated: true, isLoading: false, mfaPending: false, tempToken: null });
  }, [state.tempToken]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefresh();
      await api.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ } finally {
      tokenStorage.clear();
      setState({ user: null, isAuthenticated: false, isLoading: false, mfaPending: false, tempToken: null });
      window.location.href = '/';
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = (await api.get('/auth/me')) as unknown as AuthMeRes;
      const user = res.user!;
      tokenStorage.setUser(user);
      setState(s => ({ ...s, user }));
    } catch { /* ignore */ }
  }, []);

  const can = useCallback((permission: keyof NonNullable<AuthUser['permissions']>): boolean => {
    if (!state.user) return false;
    const ADMIN_ROLES = ['souverain', 'super_admin', 'admin_national'];
    if (ADMIN_ROLES.includes(state.user.role)) return true;
    return state.user.permissions?.[permission] ?? false;
  }, [state.user]);

  const isRole = useCallback((...roles: string[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const nomComplet = state.user
    ? `${state.user.grade ? state.user.grade + ' ' : ''}${state.user.prenom} ${state.user.nom}`.trim()
    : '';

  return (
    <AuthContext.Provider value={{ ...state, login, verifyMFA, logout, refreshUser, can, isRole, nomComplet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
};

export default AuthContext;
