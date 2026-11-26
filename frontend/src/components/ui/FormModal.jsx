import { AlertCircle, Loader2 } from 'lucide-react';
import Modal from './Modal';

export default function FormModal({ title, subtitle, onClose, onSubmit, saving, submitLabel = 'Salvar', serverError, note, children, size = 'md' }) {
  return (
    <Modal title={title} subtitle={subtitle} onClose={saving ? undefined : onClose} closeOnOverlay={false} size={size}>
      <form onSubmit={onSubmit} noValidate className="form">
        {note && <p className="form__note">{note}</p>}
        {serverError && (
          <div className="alert alert--error" role="alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}
        <div className="form-grid">{children}</div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="spin" /> Salvando…
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
