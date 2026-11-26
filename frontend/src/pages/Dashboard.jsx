import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Boxes, CheckCircle2, ClipboardList, Plus, Users, Activity } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States';
import { BarChart, ProgressList } from '../components/charts/Charts';
import { useAsync } from '../hooks/useAsync';
import { usePageTitle } from '../hooks/usePageTitle';
import { dashboardService } from '../services/dashboardService';
import { ETAPA_COLORS, LABELS } from '../constants/domain';
import { formatDate, formatDateTime, formatNumber } from '../utils/format';

const pedidoColumns = [
  { key: 'codigo', header: 'Código' },
  { key: 'clienteNome', header: 'Cliente' },
  { key: 'quantidadePecas', header: 'Peças', render: (p) => formatNumber(p.quantidadePecas) },
  { key: 'prazoEntrega', header: 'Prazo', render: (p) => formatDate(p.prazoEntrega) },
  { key: 'situacao', header: 'Situação', render: (p) => <StatusBadge value={p.situacao} /> },
];

export default function Dashboard() {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => dashboardService.getResumo(), []);
  const ind = data?.indicadores;
  const etapas = (ind?.lotesPorEtapa ?? []).map((e) => ({ label: LABELS[e.etapa] ?? e.etapa, value: e.lotes, pecas: e.pecas, color: ETAPA_COLORS[e.etapa] }));
  const showSkeleton = loading && !data;

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description="Acompanhe o andamento da produção da sua confecção em tempo real."
        actions={
          <button type="button" className="btn btn--accent" onClick={() => navigate('/lotes', { state: { novo: true } })}>
            <Plus size={16} /> Novo lote
          </button>
        }
      />

      {error && !data ? (
        <Card><ErrorState error={error} onRetry={reload} /></Card>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Clientes" value={ind?.clientes} icon={Users} tone="olive" loading={showSkeleton} />
            <StatCard label="Pedidos em andamento" value={ind?.pedidosEmAndamento} icon={ClipboardList} tone="yellow" loading={showSkeleton} />
            <StatCard label="Lotes ativos" value={ind?.lotesAtivos} icon={Boxes} tone="navy" loading={showSkeleton} />
            <StatCard label="Lotes atrasados" value={ind?.lotesAtrasados} icon={AlertTriangle} tone="orange" loading={showSkeleton} />
            <StatCard label="Lotes concluídos" value={ind?.lotesConcluidos} icon={CheckCircle2} tone="olive" loading={showSkeleton} />
          </div>

          <div className="grid-2">
            <Card title="Produção por etapa" description="Quantidade de lotes em cada etapa produtiva.">
              {showSkeleton ? <LoadingState /> : <BarChart data={etapas} ariaLabel="Lotes por etapa produtiva" unit=" lotes" />}
            </Card>
            <Card title="Resumo das etapas produtivas" description="Distribuição atual dos lotes ativos.">
              {showSkeleton ? (
                <LoadingState />
              ) : (
                <ProgressList items={etapas.map((e) => ({ label: e.label, value: e.value, hint: `${formatNumber(e.pecas)} peças`, color: e.color }))} />
              )}
            </Card>
          </div>

          <Card title="Pedidos recentes" action={<Link to="/pedidos" className="link">Ver todos</Link>}>
            <DataTable columns={pedidoColumns} rows={data?.pedidosRecentes} loading={loading} error={error} onRetry={reload} emptyTitle="Nenhum pedido cadastrado" caption="Pedidos recentes" />
          </Card>

          <div className="grid-2">
            <Card title="Movimentações recentes" action={<Link to="/movimentacoes" className="link">Ver todas</Link>}>
              {showSkeleton ? (
                <LoadingState />
              ) : !data?.movimentacoesRecentes?.length ? (
                <EmptyState icon={Activity} title="Nenhuma movimentação registrada" />
              ) : (
                <ul className="feed">
                  {data.movimentacoesRecentes.map((m) => (
                    <li key={m.id}>
                      <strong>{m.loteCodigo} · {LABELS[m.etapa] ?? m.etapa}</strong>
                      <span>{formatNumber(m.aprovadas)} aprovadas · {formatNumber(m.defeitos)} com defeito</span>
                      <small>{m.responsavel} · {formatDateTime(m.dataHora)}</small>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Notificações importantes" action={<Link to="/notificacoes" className="link">Central de notificações</Link>}>
              {showSkeleton ? (
                <LoadingState />
              ) : !data?.notificacoes?.length ? (
                <EmptyState title="Nenhuma notificação pendente" description="Você está em dia com os avisos." />
              ) : (
                <ul className="feed">
                  {data.notificacoes.map((n) => (
                    <li key={n.id}>
                      <strong>{n.descricao}</strong>
                      <small>{formatDateTime(n.dataHora)}</small>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
