// Gráficos leves em SVG/CSS (sem biblioteca externa). Recebem apenas arrays de dados prontos.
import { formatNumber } from '../../utils/format';

export function BarChart({ data, ariaLabel, height = 200, unit = '' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const summary = data.map((d) => `${d.label}: ${formatNumber(d.value)}${unit}`).join('; ');
  return (
    <div className="bar-chart" role="img" aria-label={`${ariaLabel}. ${summary}`} style={{ height }}>
      {data.map((d) => (
        <div className="bar-chart__col" key={d.label}>
          <span className="bar-chart__value">{formatNumber(d.value)}</span>
          <div className="bar-chart__track">
            <div className="bar-chart__bar" style={{ height: `${(d.value / max) * 100}%`, background: d.color }} />
          </div>
          <span className="bar-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ segments, centerLabel, ariaLabel }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 25; // começa no topo
  const summary = segments.map((s) => `${s.label}: ${formatNumber(s.value)}`).join('; ');
  return (
    <div className="donut">
      <svg viewBox="0 0 42 42" className="donut__svg" role="img" aria-label={`${ariaLabel}. ${summary}`}>
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#ebe4d2" strokeWidth="6" />
        {total > 0 &&
          segments.map((s) => {
            const pct = (s.value / total) * 100;
            const circle = (
              <circle key={s.label} cx="21" cy="21" r="15.9155" fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset} />
            );
            offset -= pct;
            return circle;
          })}
        <text x="21" y="20" textAnchor="middle" className="donut__total">
          {formatNumber(total)}
        </text>
        <text x="21" y="26" textAnchor="middle" className="donut__caption">
          {centerLabel}
        </text>
      </svg>
      <ul className="legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="legend__dot" style={{ background: s.color }} />
            {s.label}: <strong>{formatNumber(s.value)}</strong>
            {total > 0 && <em> ({Math.round((s.value / total) * 100)}%)</em>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Barras horizontais com rótulo e valor — usado em resumos de etapas.
export function ProgressList({ items, total }) {
  const max = total ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="progress-list">
      {items.map((i) => (
        <li key={i.label}>
          <div className="progress-list__head">
            <span>{i.label}</span>
            <strong>
              {formatNumber(i.value)}
              {i.hint && <small> · {i.hint}</small>}
            </strong>
          </div>
          <div className="progress" role="presentation">
            <div className="progress__bar" style={{ width: `${Math.min(100, (i.value / max) * 100)}%`, background: i.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
