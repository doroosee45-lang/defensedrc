/**
 * Client API centralisé avec gestion automatique du JWT et refresh token.
 * Toutes les requêtes passent ici — jamais de fetch direct dans les composants.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ─── Stockage des tokens (mémoire + localStorage) ────────────────────────────
let _accessToken: string | null = null;

export const tokenStorage = {
  getAccess: () => _accessToken,
  setAccess: (t: string | null) => { _accessToken = t; },

  getRefresh: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('milsys_refresh_token');
  },
  setRefresh: (t: string | null) => {
    if (typeof window === 'undefined') return;
    if (t) localStorage.setItem('milsys_refresh_token', t);
    else localStorage.removeItem('milsys_refresh_token');
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('milsys_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setUser: (user: unknown) => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem('milsys_user', JSON.stringify(user));
    else localStorage.removeItem('milsys_user');
  },

  clear: () => {
    _accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('milsys_refresh_token');
      localStorage.removeItem('milsys_user');
    }
  },
};

// ─── Refresh silencieux ────────────────────────────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

const silentRefresh = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token vraiment expiré/invalide → déconnecter
          tokenStorage.clear();
          window.location.href = '/';
        }
        return null;
      }

      const data = await res.json();
      tokenStorage.setAccess(data.accessToken);
      tokenStorage.setRefresh(data.refreshToken);
      return data.accessToken;
    } catch {
      // Erreur réseau (serveur hors ligne) → ne pas effacer la session
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: { field: string; message: string }[];
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

// ─── Constructeur de query string ─────────────────────────────────────────────
const buildQueryString = (params: RequestOptions['params']): string => {
  if (!params) return '';
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
};

// ─── Requête principale ───────────────────────────────────────────────────────
const request = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { params, skipAuth = false, ...fetchOptions } = options;

  const url = `${API_URL}${endpoint}${buildQueryString(params)}`;

  const headers: Record<string, string> = {
    ...(fetchOptions.body && !(fetchOptions.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...fetchOptions, headers });

  // Token expiré → refresh puis retry une fois
  if (res.status === 401 && !skipAuth) {
    const newToken = await silentRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...fetchOptions, headers });
    }
  }

  const contentType = res.headers.get('content-type') || '';
  const json: ApiResponse<T> = contentType.includes('application/json')
    ? await res.json()
    : { success: false, message: `Erreur ${res.status}: ${res.statusText}` };

  if (!res.ok) {
    throw Object.assign(new Error(json.message || `HTTP ${res.status}`), {
      status: res.status,
      errors: json.errors,
      response: json,
    });
  }

  return json;
};

// ─── Méthodes REST ────────────────────────────────────────────────────────────
const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: formData }),
};

export default api;
