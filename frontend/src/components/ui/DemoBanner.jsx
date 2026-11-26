import { FlaskConical } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <FlaskConical size={16} aria-hidden="true" />
      <span>
        <strong>Modo demonstração:</strong> os dados exibidos são fictícios e não vêm do banco de dados. Defina <code>VITE_API_URL</code> para usar o back-end.
      </span>
    </div>
  );
}
