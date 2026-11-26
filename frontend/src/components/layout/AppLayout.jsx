import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DemoBanner from '../ui/DemoBanner';
import { NotificationsProvider } from '../../context/NotificationsContext';
import { env } from '../../config/env';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <NotificationsProvider>
      <div className="app-shell">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        <div className="app-main">
          <Header onMenu={() => setMenuOpen(true)} />
          {env.DEMO_MODE && <DemoBanner />}
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}
