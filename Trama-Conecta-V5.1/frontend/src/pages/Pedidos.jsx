import { useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import SearchInput from '../components/ui/SearchInput';
import RowActions from '../components/ui/RowActions';
import StatusBadge from '../components/ui/StatusBadge';
import PedidoFormModal from '../components/forms/PedidoFormModal';
import PedidoDetailsModal from '../components/details/PedidoDetailsModal';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePageTitle } from '../hooks/usePageTitle';
import { pedidosService } from '../services/pedidosService';
import { SITUACOES_PEDIDO } from '../constants/domain';
import { formatDate, formatNumber } from '../utils/format';

export default function Pedidos() {
  usePageTitle('Pedidos');
  const [busca, setBusca] = useState('');
  const [situacao, setSituacao] = useState('');
  const termo = useDebouncedValue(busca);
  const { data, loading, error, reload } = useAsync(() => pedidosService.list({ search: termo, situacao }), [termo, situacao]);
  const [form, setForm] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const filtrando = Boolean(termo || situacao);

  const columns = [
    { key: 'codigo', header: 'Código', render: (p) => <strong>{p.codigo ?? '—'}</strong> },
    { key: 'clienteNome', header: 'Cliente' },
    { key: 'quantidadePecas', header: 'Peças', className: 'num', render: (p) => formatNumber(p.quantidadePecas) },
    { key: 'dataRecebimento', header: 'Recebimento', render: (p) => formatDate(p.dataRecebimento) },
    { key: 'prazoEntrega', header: 'Prazo', render: (p) => formatDate(p.prazoEntrega) },
    { key: 'situacao', header: 'Situação', render: (p) => <StatusBadge value={p.situacao} /> },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'actions',
      render: (p) => (
        <RowActions
          actions={[
            { label: `Visualizar pedido ${p.codigo}`, icon: Eye, onClick: () => setDetalhe(p) },
            { label: `Editar pedido ${p.codigo}`, icon: Pencil, onClick: () => setForm({ pedido: p }) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Produção"
        title="Pedidos"
        description="Cada pedido pode conter um ou mais lotes de produção."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setForm({})}>
            <Plus size={16} /> Novo pedido
          </button>
        }
      />
      <Card>
        <div className="toolbar">
          <SearchInput label="Buscar pedido" placeholder="Buscar por código, cliente ou descrição" value={busca} onChange={setBusca} />
          <label className="filter">
            <span className="sr-only">Filtrar por situação</span>
            <select className="input" value={situacao} onChange={(e) => setSituacao(e.target.value)}>
              <option value="">Todas as situações</option>
              {SITUACOES_PEDIDO.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={reload}
          caption="Lista de pedidos"
          emptyTitle={filtrando ? 'Nenhum pedido encontrado' : 'Nenhum pedido cadastrado'}
          emptyDescription={filtrando ? 'Ajuste a busca ou os filtros.' : 'Cadastre um pedido para vincular lotes de produção.'}
        />
      </Card>

      {form && (
        <PedidoFormModal
          pedido={form.pedido}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            reload();
          }}
        />
      )}
      {detalhe && (
        <PedidoDetailsModal
          pedido={detalhe}
          onClose={() => setDetalhe(null)}
          onEdit={() => {
            setForm({ pedido: detalhe });
            setDetalhe(null);
          }}
          onChanged={(updated) => {
            setDetalhe((current) => ({ ...current, ...updated }));
            reload();
          }}
        />
      )}
    </>
  );
}
