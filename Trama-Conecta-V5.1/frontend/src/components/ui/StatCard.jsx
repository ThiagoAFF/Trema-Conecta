import { formatNumber } from '../../utils/format';

export default function StatCard({ label, value, icon: Icon, tone = 'olive', loading, suffix }) {
  return (
    <div className={`stat stat--${tone}`}>
      {Icon && (
        <span className="stat__icon" aria-hidden="true">
          <Icon size={20} />
        </span>
      )}
      <div>
        <strong className={loading ? 'skeleton' : ''}>{loading || value === undefined || value === null ? '—' : formatNumber(value)}{!loading && suffix}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
