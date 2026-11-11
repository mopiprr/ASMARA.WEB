import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  clearSession,
  getAccessToken,
  refreshSession,
} from './authSession';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5243'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Pasang access token di setiap request.
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Sesi habis -> kembali ke halaman login (simpan halaman asal).
function redirectToLogin() {
  if (window.location.pathname === '/') return;

  const from = window.location.pathname + window.location.search;

  window.location.assign(`/?expired=1&from=${encodeURIComponent(from)}`);
}

// 401 -> coba refresh access token sekali, lalu ulangi request yang gagal.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    const refreshed = await refreshSession();

    if (!refreshed) {
      clearSession();
      redirectToLogin();

      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${getAccessToken()}`;

    return api(original);
  }
);

export default api;