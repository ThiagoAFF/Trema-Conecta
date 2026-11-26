import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

// Pilha de modais abertos: ESC fecha apenas o de cima; o scroll da página só volta com todos fechados.
const stack = [];

export default function Modal({ title, subtitle, onClose, children, footer, size = 'md', closeOnOverlay = true }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const token = {};
    stack.push(token);
    document.body.classList.add('no-scroll');
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === token) closeRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(token), 1);
      if (!stack.length) document.body.classList.remove('no-scroll');
      previous?.focus?.();
    };
  }, []);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (closeOnOverlay && e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`modal modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={panelRef}>
        <header className="modal__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="icon-btn" onClick={() => onClose?.()} aria-label="Fechar" disabled={!onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}
