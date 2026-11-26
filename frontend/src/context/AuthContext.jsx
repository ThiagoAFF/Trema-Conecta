import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { authStorage, UNAUTHORIZED_EVENT } from '../services/authStorage';
import { empresaService } from '../services/empresaService';
import { usuariosService } from '../services/usuariosService';
import { env } from '../config/env';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authStorage.read());

  useEffect(() => {
    const onUnauthorized = () => setSession(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    const token = data.token || data.accessToken;
    if (!token) throw new Error('A API não retornou um token de acesso.');
    authStorage.write({ token });
    try {
      const [empresa, usuarios] = env.DEMO_MODE
        ? [data.empresa, [data.usuario]]
        : await Promise.all([empresaService.getAtual(), usuariosService.list()]);
      const email = credentials.codigoEmpresa?.trim().toLowerCase();
      const usuario = usuarios.find((u) => u?.email?.toLowerCase() === email) || data.usuario || { email };
      const next = { token, empresa, usuario };
      authStorage.write(next);
      setSession(next);
      return next;
    } catch (error) {
      authStorage.clear();
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); }
    catch { /* A limpeza da sessão local deve ocorrer mesmo sem conexão. */ }
    finally { authStorage.clear(); setSession(null); }
  }, []);

  const updateEmpresa = useCallback((patch) => {
    setSession((current) => {
      if (!current) return current;
      const next = { ...current, empresa: { ...current.empresa, ...patch } };
      authStorage.write(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session?.token),
      empresa: session?.empresa ?? null,
      usuario: session?.usuario ?? null,
      login,
      logout,
      updateEmpresa,
    }),
    [session, login, logout, updateEmpresa],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
