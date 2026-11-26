import { useState } from 'react';
import { Activity, AlertTriangle, ArrowRight, Bell, CheckCheck, CheckCircle2, Clock, Check } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationsContext';
import { notificacoesService } from '../services/notificacoesService';
import { formatDateTime } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

const ICONS = { atraso: AlertTriangle, prazoProximo: Clock, mudancaEtapa: ArrowRight, novaMovimentacao: Activity, loteConcluido: CheckCircle2 };

export default function Notificacoes() {
  usePageTitle('Notificações');
  const toast = useToast();
  const { refreshUnread } = useNotifications();
  const [filtro, setFiltro] = useState('todas');
  const { data, loading, error, reload } = useAsync(() => notificacoesService.list(filtro === 'nao_lidas' ? { lida: false } : {}), [filtro]);
  const [busy, setBusy] = useState(false);
  const temNaoLidas = (data ?? []).some((n) => !n.lida);

  const executar = async (acao, mensagem) => {
    setBusy(true);
    try {
      await acao();
      if (mensagem) toast.success(mensagem);
      await Promise.all([reload(), refreshUnread()]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Acompanhamento"
        title="Notificações"
        description="Tudo o que exige a sua atenção na produção."
        actions={
          <button type="button" className="btn btn--ghost" onClick={() => executar(() => notificacoesService.marcarTodasComoLidas(), 'Todas as notificações foram marcadas como lidas.')} disabled={busy || !temNaoLidas}>
            <CheckCheck size={16} /> Marcar todas como lidas
          </button>
        }
      />
      <Card>
        <div className="tabs" role="tablist" aria-label="Filtro de notificações">
          {[['todas', 'Todas'], ['nao_lidas', 'Não lidas']].map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={filtro === value} className={`tab${filtro === value ? ' is-active' : ''}`} onClick={() => setFiltro(value)}>
              {label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState icon={Bell} title={filtro === 'nao_lidas' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'} description="Avisos de etapas, prazos e atrasos aparecerão aqui." />
        ) : (
          <ul className="notif-list" aria-busy={loading}>
            {data.map((n) => {
              const Icon = ICONS[n.tipo] ?? Bell;
              return (
                <li key={n.id} className={`notif${n.lida ? '' : ' is-unread'}`}>
                  <span className="notif__icon" aria-hidden="true"><Icon size={18} /></span>
                  <div className="notif__body">
                    <p>{n.descricao}</p>
                    <small>
                      {formatDateTime(n.dataHora)}
                      {n.loteCodigo && <span className="chip">Lote {n.loteCodigo}</span>}
                      <span className="notif__status">{n.lida ? 'Lida' : 'Não lida'}</span>
                    </small>
                  </div>
                  {!n.lida && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => executar(() => notificacoesService.marcarComoLida(n.id))} disabled={busy}>
                      <Check size={14} /> Marcar como lida
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
