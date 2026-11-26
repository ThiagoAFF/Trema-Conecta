import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import SearchInput from '../components/ui/SearchInput';
import RowActions from '../components/ui/RowActions';
import StatusBadge from '../components/ui/StatusBadge';
import LoteFormModal from '../components/forms/LoteFormModal';
import LoteDetailsModal from '../components/details/LoteDetailsModal';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePageTitle } from '../hooks/usePageTitle';
import { lotesService } from '../services/lotesService';
import { ETAPAS_COM_CONCLUIDO, LABELS, SITUACOES_LOTE } from '../constants/domain';
import { formatDate, formatNumber } from '../utils/format';

export default function Lotes() {
  usePageTitle('Lotes');
  const location = useLocation();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [etapa, setEtapa] = useState('');
  const [situacao, setSituacao] = useState('');
  const termo = useDebouncedValue(busca);
  const { data, loading, error, reload } = useAsync(() => lotesService.list({ search: termo, etapaAtual: etapa, situacao }), [termo, etapa, situacao]);
  const [form, setForm] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const filtrando = Boolean(termo || etapa || situacao);

  // Vindo do Dashboard ("Novo lote") ou de um pedido: abre o formulário já preenchido.
  useEffect(() => {
    if (location.state?.novo) {
      setForm({ defaults: { pedidoId: location.state.pedidoId } });
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [
    { key: 'codigo', header: 'Código', render: (l) => <strong>{l.codigo ?? '—'}</strong> },
    { key: 'pedidoCodigo', header: 'Pedido' },
    { key: 'quantidadePecas', header: 'Peças', className: 'num', render: (l) => formatNumber(l.quantidadePecas) },
    { key: 'dataInicio', header: 'Início', render: (l) => formatDate(l.dataInicio) },
    { key: 'previsaoConclusao', header: 'Previsão', render: (l) => formatDate(l.previsaoConclusao) },
    { key: 'etapaAtual', header: 'Etapa atual', render: (l) => LABELS[l.etapaAtual] ?? l.etapaAtual },
    { key: 'situacao', header: 'Situação', render: (l) => <StatusBadge value={l.situacao} /> },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'actions',
      render: (l) => <RowActions actions={[{ label: `Visualizar lote ${l.codigo} e QR Code`, icon: Eye, onClick: () => setDetalhe(l) }]} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Produção"
        title="Lotes"
        description="Cada lote tem código exclusivo, QR Code e acompanhamento por etapa."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setForm({})}>
            <Plus size={16} /> Novo lote
          </button>
        }
      />
      <Card>
        <div className="toolbar">
          <SearchInput label="Buscar lote" placeholder="Buscar por código, pedido ou cliente" value={busca} onChange={setBusca} />
          <label className="filter">
            <span className="sr-only">Filtrar por etapa</span>
            <select className="input" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
              <option value="">Todas as etapas</option>
              {ETAPAS_COM_CONCLUIDO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <label className="filter">
            <span className="sr-only">Filtrar por situação</span>
            <select className="input" value={situacao} onChange={(e) => setSituacao(e.target.value)}>
              <option value="">Todas as situações</option>
              {SITUACOES_LOTE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={reload}
          caption="Lista de lotes"
          emptyTitle={filtrando ? 'Nenhum lote encontrado' : 'Nenhum lote cadastrado'}
          emptyDescription={filtrando ? 'Ajuste a busca ou os filtros.' : 'Cadastre um lote a partir de um pedido.'}
        />
      </Card>

      {form && (
        <LoteFormModal
          defaults={form.defaults}
          onClose={() => setForm(null)}
          onSaved={(saved) => {
            setForm(null);
            reload();
            setDetalhe(saved); // abre o lote criado, com o QR Code
          }}
        />
      )}
      {detalhe && <LoteDetailsModal lote={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  );
}
