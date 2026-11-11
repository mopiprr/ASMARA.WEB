import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5243'}/api`;

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// Penanda "tab ini baru saja logout / sesi habis" -> tidak perlu coba refresh lagi.
const SIGNED_OUT_KEY = 'signedOut';

export interface SessionUser {
  accountId: string;
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  roles: {
    id: number;
    roleCode: string;
    roleName: string;
  }[];
}

// Response login & refresh dari backend.
export interface AuthResponse {
  accessToken: string;
  expiresAt: string;
  user: SessionUser;
}

// Instance khusus auth: tanpa interceptor dan selalu mengirim cookie refresh token.
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ==========================================
// PENYIMPANAN SESI DI TAB INI
// ==========================================
// Access token (15 menit) disimpan di sessionStorage.
// "Remember me" sekarang diatur oleh cookie refresh token dari backend.

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

// Data user yang login (disimpan saat login / refresh).
export function getSessionUser(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);

    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function hasSession() {
  return Boolean(getAccessToken());
}

// false kalau tab ini baru logout / refresh baru saja gagal.
// Dipakai route guard supaya tidak memanggil /auth/refresh yang pasti 401.
export function canTryRefresh() {
  return sessionStorage.getItem(SIGNED_OUT_KEY) !== '1';
}

// notify=false dipakai saat refresh supaya Topbar tidak reload profil tiap 15 menit.
export function saveSession(data: AuthResponse, notify = true) {
  sessionStorage.setItem(TOKEN_KEY, data.accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  sessionStorage.removeItem(SIGNED_OUT_KEY);

  // Bersihkan sisa versi lama (dulu Remember me memakai localStorage).
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (notify) {
    window.dispatchEvent(new Event('auth-changed'));
  }
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.setItem(SIGNED_OUT_KEY, '1');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event('auth-changed'));
}

// ==========================================
// LOGIN / REFRESH / LOGOUT
// ==========================================

export async function login(userName: string, password: string, rememberMe: boolean) {
  const response = await authApi.post<AuthResponse>('/auth/login', {
    userName,
    password,
    rememberMe,
  });

  saveSession(response.data);

  return response.data;
}

let refreshPromise: Promise<boolean> | null = null;

async function requestNewAccessToken(): Promise<boolean> {
  // Retry hanya kalau tab ini sudah punya sesi (kemungkinan bentrok dengan tab lain).
  // Saat baru buka link / belum login, cukup sekali coba.
  const maxAttempts = hasSession() ? 2 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await authApi.post<AuthResponse>('/auth/refresh');

      saveSession(response.data, false);

      return true;
    } catch (error) {
      const isUnauthorized =
        axios.isAxiosError(error) && error.response?.status === 401;

      // Tab lain mungkin baru saja memperbarui cookie -> tunggu sebentar lalu coba lagi.
      if (attempt < maxAttempts && isUnauthorized) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        continue;
      }

      break;
    }
  }

  // Gagal -> tandai supaya route guard di tab ini tidak mencoba refresh lagi.
  sessionStorage.setItem(SIGNED_OUT_KEY, '1');

  return false;
}

// Minta access token baru memakai refresh token (cookie).
// Hanya satu request refresh yang berjalan dalam satu waktu.
export function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function logout() {
  try {
    // Cabut refresh token di server + hapus cookie.
    await authApi.post('/auth/logout');
  } catch {
    // Tetap keluar walaupun server tidak bisa dihubungi.
  } finally {
    clearSession();
  }
}