import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notificacoesService } from '../services/notificacoesService';

const NotificationsContext = createContext({ unread: 0, refreshUnread: () => {} });

// Mantém o contador do sino no cabeçalho. Atualiza ao montar, a cada minuto e sob demanda.
export function NotificationsProvider({ children }) {
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      setUnread(await notificacoesService.contarNaoLidas());
    } catch {
      /* o contador é auxiliar: falhas aparecem na própria tela de notificações */
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const id = setInterval(refreshUnread, 60000);
    return () => clearInterval(id);
  }, [refreshUnread]);

  const value = useMemo(() => ({ unread, refreshUnread }), [unread, refreshUnread]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export const useNotifications = () => useContext(NotificationsContext);
