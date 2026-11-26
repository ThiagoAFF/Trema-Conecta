import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import SearchInput from '../components/ui/SearchInput';
import RowActions from '../components/ui/RowActions';
import MovimentacaoFormModal from '../components/forms/MovimentacaoFormModal';
import MovimentacaoDetailsModal from '../components/details/MovimentacaoDetailsModal';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNotifications } from '../context/NotificationsContext';
import { movimentacoesService } from '../services/movimentacoesService';
import { ETAPAS_COM_CONCLUIDO, LABELS } from '../constants/domain';
import { formatDateTime, formatNumber } from '../utils/format';

export default function Movimentacoes() {
  usePageTitle('Movimentações');
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUnread } = useNotifications();
  const [busca, setBusca] = useState('');
  const [etapa, setEtapa] = useState('');
  const termo = useDebouncedValue(busca);
  const { data, loading, error, reload } = useAsync(() => movimentacoesService.list({ search: termo, etapa }), [termo, etapa]);
  const [form, setForm] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const filtrando = Boolean(termo || etapa);

  useEffect(() => {
    if (location.state?.novo) {
      setForm({ defaults: { loteId: location.state.loteId } });
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { key: 'dataHora', header: 'Data e hora', render: (m) => formatDateTime(m.dataHora) },
    { key: 'loteCodigo', header: 'Lote', render: (m) => <strong>{m.loteCodigo ?? '—'}</strong> },
    { key: 'etapa', header: 'Etapa', render: (m) => LABELS[m.etapa] ?? m.etapa },
    { key: 'responsavel', header: 'Responsável' },
    { key: 'aprovadas', header: 'Aprovadas', className: 'num', render: (m) => formatNumber(m.aprovadas) },
    { key: 'defeitos', header: 'Defeitos', className: 'num', render: (m) => formatNumber(m.defeitos) },
    { key: 'observacoes', header: 'Observações', render: (m) => <span className="truncate" title={m.observacoes}>{m.observacoes || '—'}</span> },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'actions',
      render: (m) => <RowActions actions={[{ label: `Visualizar movimentação do lote ${m.loteCodigo}`, icon: Eye, onClick: () => setDetalhe(m) }]} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Rastreabilidade"
        title="Movimentações"
        description="Toda passagem de etapa registrada com responsável e resultado da conferência."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setForm({})}>
            <Plus size={16} /> Registrar movimentação
          </button>
        }
      />
      <Card>
        <div className="toolbar">
          <SearchInput label="Buscar movimentação" placeholder="Buscar por lote, responsável ou observação" value={busca} onChange={setBusca} />
          <label className="filter">
            <span className="sr-only">Filtrar por etapa</span>
            <select className="input" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
              <option value="">Todas as etapas</option>
              {ETAPAS_COM_CONCLUIDO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={reload}
          caption="Histórico de movimentações"
          emptyTitle={filtrando ? 'Nenhuma movimentação encontrada' : 'Nenhuma movimentação registrada'}
          emptyDescription={filtrando ? 'Ajuste a busca ou os filtros.' : 'Registre a passagem de um lote por uma etapa da produção.'}
        />
      </Card>

      {form && (
        <MovimentacaoFormModal
          defaults={form.defaults}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            reload();
            refreshUnread();
          }}
        />
      )}
      {detalhe && <MovimentacaoDetailsModal movimentacao={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  );
}
