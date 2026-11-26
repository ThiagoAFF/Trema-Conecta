import { AlertCircle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../../utils/errors';

export function LoadingState({ label = 'Carregando…' }) {
  return (
    <div className="state" role="status">
      <Loader2 size={22} className="spin" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title = 'Nenhum registro encontrado', description, action, icon: Icon = Inbox }) {
  return (
    <div className="state">
      <Icon size={28} aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <AlertCircle size={28} aria-hidden="true" />
      <h3>Não foi possível carregar os dados</h3>
      <p>{getErrorMessage(error)}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
          <RefreshCw size={14} /> Tentar novamente
        </button>
      )}
    </div>
  );
}
