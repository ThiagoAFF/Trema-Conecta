const KEY = 'trama.auth.integrado';
export const UNAUTHORIZED_EVENT = 'trama:unauthorized';

export const authStorage = {
  read() {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  write(session) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      /* armazenamento indisponível */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* armazenamento indisponível */
    }
  },
  getToken() {
    return authStorage.read()?.token ?? null;
  },
};
