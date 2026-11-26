import Modal from '../ui/Modal';
import { Detail, DetailList } from '../ui/Detail';
import StatusBadge from '../ui/StatusBadge';
import { formatDateTime, formatNumber } from '../../utils/format';

export default function MovimentacaoDetailsModal({ movimentacao: m, onClose }) {
  return (
    <Modal
      title={`Movimentação — lote ${m.loteCodigo ?? ''}`}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <DetailList>
        <Detail label="Data e hora">{formatDateTime(m.dataHora)}</Detail>
        <Detail label="Etapa"><StatusBadge value={m.etapa} tone="neutral" /></Detail>
        <Detail label="Responsável">{m.responsavel}</Detail>
        <Detail label="Aprovadas">{formatNumber(m.aprovadas)}</Detail>
        <Detail label="Com defeito">{formatNumber(m.defeitos)}</Detail>
        <Detail label="Observações" wide>{m.observacoes || '—'}</Detail>
      </DetailList>
    </Modal>
  );
}
