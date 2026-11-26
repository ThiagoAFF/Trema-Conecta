import { useState } from 'react';
import { Eye, Pencil, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import SearchInput from '../components/ui/SearchInput';
import RowActions from '../components/ui/RowActions';
import ClienteFormModal from '../components/forms/ClienteFormModal';
import ClienteDetailsModal from '../components/details/ClienteDetailsModal';
import { useAsync } from '../hooks/useAsync';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { usePageTitle } from '../hooks/usePageTitle';
import { clientesService } from '../services/clientesService';
import { formatNumber } from '../utils/format';

export default function Clientes() {
  usePageTitle('Clientes');
  const [busca, setBusca] = useState('');
  const termo = useDebouncedValue(busca);
  const { data, loading, error, reload } = useAsync(() => clientesService.list({ search: termo }), [termo]);
  const [form, setForm] = useState(null); // { cliente? }
  const [detalhe, setDetalhe] = useState(null);

  const columns = [
    {
      key: 'nome',
      header: 'Cliente',
      render: (c) => (
        <>
          <strong>{c.nome}</strong>
          <small className="cell-sub">{c.documento}</small>
        </>
      ),
    },
    { key: 'cidade', header: 'Cidade', render: (c) => [c.cidade, c.estado].filter(Boolean).join(' / ') || '—' },
    { key: 'telefone', header: 'Telefone' },
    { key: 'email', header: 'E-mail' },
    { key: 'totalPedidos', header: 'Pedidos', className: 'num', render: (c) => formatNumber(c.totalPedidos ?? 0) },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'actions',
      render: (c) => (
        <RowActions
          actions={[
            { label: `Visualizar ${c.nome}`, icon: Eye, onClick: () => setDetalhe(c) },
            { label: `Editar ${c.nome}`, icon: Pencil, onClick: () => setForm({ cliente: c }) },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Cadastros"
        title="Clientes"
        description="Lojas, distribuidoras e marcas atendidas pela sua confecção."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setForm({})}>
            <Plus size={16} /> Novo cliente
          </button>
        }
      />
      <Card>
        <div className="toolbar">
          <SearchInput label="Buscar cliente" placeholder="Buscar por nome, cidade ou e-mail" value={busca} onChange={setBusca} />
        </div>
        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={reload}
          caption="Lista de clientes"
          emptyTitle={termo ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          emptyDescription={termo ? 'Tente outro termo de busca.' : 'Cadastre o primeiro cliente para começar a registrar pedidos.'}
        />
      </Card>

      {form && (
        <ClienteFormModal
          cliente={form.cliente}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            reload();
          }}
        />
      )}
      {detalhe && (
        <ClienteDetailsModal
          cliente={detalhe}
          onClose={() => setDetalhe(null)}
          onEdit={() => {
            setForm({ cliente: detalhe });
            setDetalhe(null);
          }}
        />
      )}
    </>
  );
}
