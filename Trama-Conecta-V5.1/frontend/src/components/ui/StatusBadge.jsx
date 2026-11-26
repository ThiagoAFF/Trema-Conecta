import { LABELS, STATUS_TONE } from '../../constants/domain';

export default function StatusBadge({ value, tone }) {
  if (!value) return <span className="badge badge--neutral">—</span>;
  return <span className={`badge badge--${tone ?? STATUS_TONE[value] ?? 'neutral'}`}>{LABELS[value] ?? value}</span>;
}
