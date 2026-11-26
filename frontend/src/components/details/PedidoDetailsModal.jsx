import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Detail, DetailList } from '../ui/Detail';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { lotesService } from '../../services/lotesService';
import { pedidosService } from '../../services/pedidosService';
import { LABELS } from '../../constants/domain';
import { getErrorMessage } from '../../utils/errors';
import { formatDate, formatNumber } from '../../utils/format';

const columns = [
  { key: 'codigo', header: 'Lote' },
  { key: 'quantidadePecas', header: 'Peças', render: (l) => formatNumber(l.quantidadePecas) },
  { key: 'etapaAtual', header: 'Etapa atual', render: (l) => LABELS[l.etapaAtual] ?? l.etapaAtual },
  { key: 'situacao', header: 'Situação', render: (l) => <StatusBadge value={l.situacao} /> },
];

export default function PedidoDetailsModal({ pedido, onClose, onEdit, onChanged }) {
  const toast = useToast();
  const navigate = useNavigate();
  const lotes = useAsync(() => lotesService.list({ pedidoId: pedido.id }), [pedido.id]);
  const [pending, setPending] = useState(null); // 'concluido' | 'atrasado'
  const [busy, setBusy] = useState(false);

  const confirmar = async () => {
    setBusy(true);
    try {
      const updated = await pedidosService.setSituacao(pedido.id, pending);
      toast.success(`Pedido marcado como ${LABELS[pending].toLowerCase()}.`);
      setPending(null);
      onChanged(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Modal
        title={`Pedido ${pedido.codigo ?? ''}`}
        subtitle="Detalhes do pedido"
        onClose={onClose}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Fechar
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setPending('atrasado')} disabled={pedido.situacao === 'atrasado' || pedido.situacao === 'concluido'}>
              Marcar como atrasado
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setPending('concluido')} disabled={pedido.situacao === 'concluido'}>
              Marcar como concluído
            </button>
            <button type="button" className="btn btn--primary" onClick={onEdit}>
              Editar pedido
            </button>
          </>
        }
      >
        <DetailList>
          <Detail label="Cliente">{pedido.clienteNome}</Detail>
          <Detail label="Situação"><StatusBadge value={pedido.situacao} /></Detail>
          <Detail label="Quantidade de peças">{formatNumber(pedido.quantidadePecas)}</Detail>
          <Detail label="Recebimento">{formatDate(pedido.dataRecebimento)}</Detail>
          <Detail label="Prazo de entrega">{formatDate(pedido.prazoEntrega)}</Detail>
          <Detail label="Descrição" wide>{pedido.descricao}</Detail>
        </DetailList>
        <div className="subtitle-row">
          <h3 className="subtitle">Lotes vinculados</h3>
          <button type="button" className="btn btn--accent btn--sm" onClick={() => navigate('/lotes', { state: { novo: true, pedidoId: pedido.id } })}>
            Novo lote para este pedido
          </button>
        </div>
        <DataTable columns={columns} rows={lotes.data} loading={lotes.loading} error={lotes.error} onRetry={lotes.reload} emptyTitle="Nenhum lote vinculado a este pedido" caption="Lotes do pedido" />
      </Modal>

      {pending && (
        <ConfirmDialog
          title={`Marcar como ${LABELS[pending].toLowerCase()}?`}
          message={`A situação do pedido ${pedido.codigo ?? ''} será alterada para "${LABELS[pending]}".`}
          confirmLabel="Confirmar"
          busy={busy}
          onConfirm={confirmar}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
