import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ current, total, onPageChange }) {
  if (total <= 1) return null;

  const getPages = () => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, '...', total];
    if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40
          disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, i) => (
        page === '...'
          ? <span key={`dot-${i}`} className="px-2 text-gray-400">...</span>
          : <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition
                ${current === page
                  ? 'bg-green-500 text-white'
                  : 'border hover:bg-gray-50 text-gray-700'
                }`}
            >
              {page}
            </button>
      ))}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-40
          disabled:cursor-not-allowed transition"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}