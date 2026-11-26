import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Printer } from 'lucide-react';
import Modal from '../ui/Modal';
import { Detail, DetailList } from '../ui/Detail';
import StatusBadge from '../ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../ui/States';
import EtapaStepper from './EtapaStepper';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../context/ToastContext';
import { movimentacoesService } from '../../services/movimentacoesService';
import { LABELS } from '../../constants/domain';
import { copyText } from '../../utils/clipboard';
import { printQrCode } from '../../utils/printQr';
import { formatDate, formatDateTime, formatNumber } from '../../utils/format';

export default function LoteDetailsModal({ lote, onClose }) {
  const toast = useToast();
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const movs = useAsync(() => movimentacoesService.list({ loteId: lote.id }), [lote.id, lote.etapaAtual]);
  // O QR Code identifica o lote. Se o back-end enviar `qrCode` (ex.: uma URL de consulta), ele é usado; senão, o código do lote.
  const qrValue = lote.qrCode || lote.codigo || String(lote.id);

  const copiar = async () => {
    (await copyText(lote.codigo)) ? toast.success('Código do lote copiado.') : toast.error('Não foi possível copiar o código.');
  };
  const imprimir = () => {
    if (!printQrCode(qrRef.current, lote.codigo)) toast.error('Não foi possível abrir a impressão. Verifique se o navegador bloqueou a janela.');
  };

  return (
    <Modal
      title={`Lote ${lote.codigo ?? ''}`}
      subtitle="Acompanhamento da produção"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fechar
          </button>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/movimentacoes', { state: { novo: true, loteId: lote.id } })} disabled={lote.situacao === 'concluido'}>
            Registrar movimentação
          </button>
        </>
      }
    >
      <DetailList>
        <Detail label="Pedido">{lote.pedidoCodigo}</Detail>
        <Detail label="Cliente">{lote.clienteNome}</Detail>
        <Detail label="Quantidade de peças">{formatNumber(lote.quantidadePecas)}</Detail>
        <Detail label="Situação"><StatusBadge value={lote.situacao} /></Detail>
        <Detail label="Início">{formatDate(lote.dataInicio)}</Detail>
        <Detail label="Previsão de conclusão">{formatDate(lote.previsaoConclusao)}</Detail>
      </DetailList>

      <h3 className="subtitle">Acompanhamento do lote</h3>
      <EtapaStepper etapaAtual={lote.etapaAtual} />
      {movs.loading && !movs.data ? (
        <LoadingState label="Carregando movimentações…" />
      ) : movs.error && !movs.data ? (
        <ErrorState error={movs.error} onRetry={movs.reload} />
      ) : !movs.data?.length ? (
        <EmptyState title="Nenhuma movimentação registrada" description="As passagens de etapa deste lote aparecerão aqui." />
      ) : (
        <ul className="timeline">
          {movs.data.map((m) => (
            <li key={m.id}>
              <strong>{LABELS[m.etapa] ?? m.etapa}</strong>
              <span>
                {formatDateTime(m.dataHora)} · {m.responsavel}
              </span>
              <span>
                {formatNumber(m.aprovadas)} aprovadas · {formatNumber(m.defeitos)} com defeito
              </span>
              {m.observacoes && <em>{m.observacoes}</em>}
            </li>
          ))}
        </ul>
      )}

      <h3 className="subtitle">QR Code do lote</h3>
      <div className="qr-box">
        <div className="qr-box__code" ref={qrRef}>
          <QRCodeSVG value={qrValue} size={152} level="M" marginSize={2} title={`QR Code do lote ${lote.codigo}`} />
        </div>
        <div>
          <p className="qr-box__code-text">{lote.codigo}</p>
          <p className="muted">Imprima e fixe no lote físico para consultar a produção rapidamente.</p>
          <div className="qr-box__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={copiar}>
              <Copy size={14} /> Copiar código
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={imprimir}>
              <Printer size={14} /> Imprimir QR Code
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
