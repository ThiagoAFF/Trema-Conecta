import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { firstLetter } from '../../utils/format';

export default function Header({ onMenu }) {
  const { usuario } = useAuth();
  const { unread } = useNotifications();
  const nome = usuario?.nome || 'Responsável';

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onMenu} aria-label="Abrir menu">
        <Menu size={20} />
      </button>
      <span className="topbar__title">Trama Conecta</span>
      <div className="topbar__right">
        <Link to="/notificacoes" className="bell" aria-label={`Notificações: ${unread} não lida${unread === 1 ? '' : 's'}`}>
          <Bell size={20} />
          <span className={`bell__count${unread ? ' is-active' : ''}`}>{unread}</span>
        </Link>
        <div className="user-chip">
          <span className="user-chip__avatar" aria-hidden="true">
            {firstLetter(nome)}
          </span>
          <span className="user-chip__name">{nome}</span>
        </div>
      </div>
    </header>
  );
}
