export default function FilterSelect({
  label, value, onChange, options = []
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs text-gray-500">{label}</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-3 pr-8 py-2 text-sm border border-gray-300
          rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
          bg-white cursor-pointer appearance-none min-w-[130px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}