import { Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', tone = 'primary', busy = false, onConfirm, onCancel }) {
  return (
    <Modal
      title={title}
      size="sm"
      onClose={busy ? undefined : onCancel}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={`btn btn--${tone}`} onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={16} className="spin" /> : null} {confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm-message">{message}</p>
    </Modal>
  );
}
