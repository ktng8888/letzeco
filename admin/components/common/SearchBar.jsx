import { Search, X } from 'lucide-react';

export default function SearchBar({
  value, onChange, onSearch, onClear, placeholder = 'Search by keywords'
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder={placeholder}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
      />
      <button onClick={onSearch}
        className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500
          hover:bg-cyan-600 text-white text-sm font-medium rounded-lg
          transition cursor-pointer">
        <Search className="w-4 h-4" />
        Search
      </button>
      <button onClick={onClear}
        className="flex items-center gap-1.5 px-4 py-2 bg-red-500
          hover:bg-red-600 text-white text-sm font-medium rounded-lg
          transition cursor-pointer">
        <X className="w-4 h-4" />
        Clear All Filters
      </button>
    </div>
  );
}