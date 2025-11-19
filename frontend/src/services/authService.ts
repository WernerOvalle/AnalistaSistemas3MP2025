import api from './api';
import type { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async register(userData: any): Promise<any> {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  getCurrentUser() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
