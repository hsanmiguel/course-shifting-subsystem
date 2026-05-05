import React from 'react';
import { BASE_URL, apiClient } from './api-client';

export interface AuthResponse {
  token: string;
  userId: string;
  userRole: 'student' | 'adviser' | 'department_head' | 'registrar' | 'system_admin';
  userEmail: string;
  userName: string;
  picture?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: AuthResponse['userRole'];
  picture?: string | null;
}

const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER_ID: 'studentId',
  USER_EMAIL: 'userEmail',
  USER_NAME: 'studentName',
  USER_ROLE: 'userRole',
  USER_PICTURE: 'userPicture',
};

async function fetchAuth<T>(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}/api/auth${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Auth error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function storeAuth(data: AuthResponse) {
  apiClient.setAuthToken(data.token);
  localStorage.setItem(STORAGE_KEYS.USER_ID, data.userId);
  localStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.userEmail);
  localStorage.setItem(STORAGE_KEYS.USER_NAME, data.userName);
  localStorage.setItem(STORAGE_KEYS.USER_ROLE, data.userRole);

  if (data.picture) {
    localStorage.setItem(STORAGE_KEYS.USER_PICTURE, data.picture);
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_PICTURE);
  }
}

export const authService = {
  async getGoogleClientId() {
    const config = await fetchAuth<{ googleClientId: string }>('/config');
    return config.googleClientId;
  },

  async loginWithGoogleCredential(credential: string) {
    const data = await fetchAuth<AuthResponse>('/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });

    storeAuth(data);
    return data;
  },

  logout(): void {
    apiClient.clearAuthToken();
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.USER_PICTURE);
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  getCurrentUser(): User | null {
    const id = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const email = localStorage.getItem(STORAGE_KEYS.USER_EMAIL);
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as User['role'] | null;
    const picture = localStorage.getItem(STORAGE_KEYS.USER_PICTURE);

    if (!id || !email || !name || !role) {
      return null;
    }

    return { id, email, name, role, picture };
  },
};

export function useAuth() {
  const [user, setUser] = React.useState<User | null>(() => authService.getCurrentUser());

  const loginWithGoogleCredential = React.useCallback(async (credential: string) => {
    await authService.loginWithGoogleCredential(credential);
    setUser(authService.getCurrentUser());
  }, []);

  const logout = React.useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return {
    user,
    loginWithGoogleCredential,
    logout,
    isAuthenticated: !!user,
  };
}
