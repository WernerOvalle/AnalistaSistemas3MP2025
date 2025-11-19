import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import type { Usuario, LoginRequest } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setUsuario(user);
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    // El backend devuelve "user" con "rol", pero el frontend usa "usuario" con "nombre_rol"
    const backendUser = (response as any).user || response.usuario;
    const usuario = {
      ...backendUser,
      nombre_rol: backendUser.rol || backendUser.nombre_rol,
      id_rol: backendUser.id_rol || 0,
    };
    localStorage.setItem('token', response.token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const hasRole = (roles: string[]) => {
    if (!usuario) return false;
    return roles.includes(usuario.nombre_rol);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        login,
        logout,
        isAuthenticated: !!usuario,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
