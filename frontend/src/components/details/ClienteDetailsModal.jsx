import Modal from '../ui/Modal';
import { Detail, DetailList } from '../ui/Detail';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { pedidosService } from '../../services/pedidosService';
import { formatDate, formatNumber } from '../../utils/format';

const columns = [
  { key: 'codigo', header: 'Código' },
  { key: 'quantidadePecas', header: 'Peças', render: (p) => formatNumber(p.quantidadePecas) },
  { key: 'prazoEntrega', header: 'Prazo', render: (p) => formatDate(p.prazoEntrega) },
  { key: 'situacao', header: 'Situação', render: (p) => <StatusBadge value={p.situacao} /> },
];

export default function ClienteDetailsModal({ cliente, onClose, onEdit }) {
  const pedidos = useAsync(() => pedidosService.list({ clienteId: cliente.id }), [cliente.id]);
  return (
    <Modal
      title={cliente.nome}
      subtitle="Dados do cliente"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="btn btn--primary" onClick={onEdit}>
            Editar cliente
          </button>
        </>
      }
    >
      <DetailList>
        <Detail label="CNPJ / CPF">{cliente.documento}</Detail>
        <Detail label="Telefone / WhatsApp">{cliente.telefone}</Detail>
        <Detail label="Cidade / Estado">{[cliente.cidade, cliente.estado].filter(Boolean).join(' / ')}</Detail>
        <Detail label="E-mail">{cliente.email}</Detail>
        <Detail label="Observações" wide>{cliente.observacoes || '—'}</Detail>
      </DetailList>
      <h3 className="subtitle">Histórico de pedidos</h3>
      <DataTable columns={columns} rows={pedidos.data} loading={pedidos.loading} error={pedidos.error} onRetry={pedidos.reload} emptyTitle="Nenhum pedido para este cliente" caption="Histórico de pedidos do cliente" />
    </Modal>
  );
}
