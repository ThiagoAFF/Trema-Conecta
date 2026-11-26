import { EmptyState, ErrorState, LoadingState } from './States';

// columns: [{ key, header, render?(row), className? }]
export default function DataTable({ columns, rows, loading, error, onRetry, emptyTitle, emptyDescription, emptyAction, rowKey = 'id', caption }) {
  const hasRows = Array.isArray(rows) && rows.length > 0;
  if (error && !hasRows) return <ErrorState error={error} onRetry={onRetry} />;
  if (loading && !hasRows) return <LoadingState />;
  if (!hasRows) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;

  return (
    <div className={`table-wrap${loading ? ' is-loading' : ''}`} aria-busy={loading}>
      <table className="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.className}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} className={c.className} data-label={c.header}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
