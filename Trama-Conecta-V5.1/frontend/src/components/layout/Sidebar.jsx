import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, BarChart3, Bell, ClipboardList, LayoutDashboard, LogOut, Package, Settings, UserCog, Users, X } from 'lucide-react';
import BrandMark from '../ui/BrandMark';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/lotes', label: 'Lotes', icon: Package },
  { to: '/movimentacoes', label: 'Movimentações', icon: ArrowLeftRight },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { to: '/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/usuarios', label: 'Usuários', icon: UserCog },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { empresa, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label="Menu principal">
      <div className="sidebar__brand">
        <BrandMark />
        <div>
          <strong>Trama Conecta</strong>
          <span>Gestão Têxtil</span>
        </div>
        <button type="button" className="icon-btn icon-btn--dark sidebar__close" onClick={onClose} aria-label="Fechar menu">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar__nav">
        <span className="sidebar__section">Operação</span>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="company-card">
          <span>Empresa ativa</span>
          <strong>{empresa?.razaoSocial || '—'}</strong>
          <small>{empresa?.codigo ? `Código ${empresa.codigo}` : '—'}</small>
        </div>
        <button type="button" className="sidebar__link sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          Sair
        </button>
      </div>
    </aside>
  );
}
