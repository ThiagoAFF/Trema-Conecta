export function DetailList({ children }) {
  return <dl className="details">{children}</dl>;
}

export function Detail({ label, children, wide }) {
  return (
    <div className={`details__item${wide ? ' details__item--wide' : ''}`}>
      <dt>{label}</dt>
      <dd>{children ?? '—'}</dd>
    </div>
  );
}
