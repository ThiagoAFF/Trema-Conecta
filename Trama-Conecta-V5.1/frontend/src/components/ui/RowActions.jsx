// Botões de ação de linha (ícone + rótulo acessível).
export default function RowActions({ actions }) {
  return (
    <div className="row-actions">
      {actions
        .filter(Boolean)
        .map(({ label, icon: Icon, onClick, tone }) => (
          <button key={label} type="button" className={`icon-btn${tone ? ` icon-btn--${tone}` : ''}`} onClick={onClick} title={label} aria-label={label}>
            <Icon size={16} />
          </button>
        ))}
    </div>
  );
}
