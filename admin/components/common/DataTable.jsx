import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  columns, data, isLoading,
  emptyMessage = 'No data found.'
}) {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.key}
                className="text-left px-4 py-3 font-semibold text-gray-600
                  whitespace-nowrap"
                style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}
                className="border-b border-gray-100 hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}