import { AlertTriangle, CheckCircle2, Clock, Factory, ThumbsDown, ThumbsUp } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { ErrorState, LoadingState } from '../components/ui/States';
import { BarChart, DonutChart, ProgressList } from '../components/charts/Charts';
import { useAsync } from '../hooks/useAsync';
import { usePageTitle } from '../hooks/usePageTitle';
import { relatoriosService } from '../services/relatoriosService';
import { ETAPA_COLORS, LABELS } from '../constants/domain';

export default function Relatorios() {
  usePageTitle('Relatórios');
  const { data, loading, error, reload } = useAsync(() => relatoriosService.getResumo(), []);
  const skeleton = loading && !data;

  const producao = (data?.producaoPorEtapa ?? []).map((e) => ({ label: LABELS[e.etapa] ?? e.etapa, value: e.pecas, color: ETAPA_COLORS[e.etapa] }));
  const lotes = (data?.lotesPorEtapa ?? []).map((e) => ({ label: LABELS[e.etapa] ?? e.etapa, value: e.lotes, color: ETAPA_COLORS[e.etapa] }));
  const totalLotes = lotes.reduce((a, l) => a + l.value, 0);

  return (
    <>
      <PageHeader eyebrow="Análise" title="Relatórios" description="Indicadores consolidados da produção da confecção." />

      {error && !data ? (
        <Card><ErrorState error={error} onRetry={reload} /></Card>
      ) : (
        <>
          <div className="stat-grid stat-grid--6">
            <StatCard label="Peças em produção" value={data?.pecasEmProducao} icon={Factory} tone="navy" loading={skeleton} />
            <StatCard label="Peças aprovadas" value={data?.pecasAprovadas} icon={ThumbsUp} tone="olive" loading={skeleton} />
            <StatCard label="Peças com defeito" value={data?.pecasDefeito} icon={ThumbsDown} tone="orange" loading={skeleton} />
            <StatCard label="Lotes concluídos" value={data?.lotesConcluidos} icon={CheckCircle2} tone="olive" loading={skeleton} />
            <StatCard label="Lotes atrasados" value={data?.lotesAtrasados} icon={AlertTriangle} tone="orange" loading={skeleton} />
            <StatCard label="Tempo médio (dias)" value={data?.tempoMedioDias} icon={Clock} tone="yellow" loading={skeleton} />
          </div>

          <div className="grid-2">
            <Card title="Produção por etapa" description="Quantidade de peças registradas em cada etapa.">
              {skeleton ? <LoadingState /> : <BarChart data={producao} ariaLabel="Peças registradas por etapa" unit=" peças" />}
            </Card>
            <Card title="Aprovadas x defeituosas" description="Resultado da conferência de qualidade registrada nas movimentações.">
              {skeleton ? (
                <LoadingState />
              ) : (
                <DonutChart
                  ariaLabel="Peças aprovadas versus defeituosas"
                  centerLabel="peças"
                  segments={[
                    { label: 'Aprovadas', value: Number(data?.pecasAprovadas ?? 0), color: '#595817' },
                    { label: 'Com defeito', value: Number(data?.pecasDefeito ?? 0), color: '#DD6A0C' },
                  ]}
                />
              )}
            </Card>
          </div>

          <Card title="Lotes por etapa atual" description="Distribuição de todos os lotes pela etapa em que se encontram.">
            {skeleton ? <LoadingState /> : <ProgressList items={lotes} total={Math.max(1, totalLotes)} />}
          </Card>
        </>
      )}
    </>
  );
}
