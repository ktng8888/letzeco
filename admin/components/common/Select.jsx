export default function Select({
  label, name, value, onChange, options = [],
  placeholder = 'Select...', required = false,
  disabled = false, error, className = ''
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        name={name} value={value} onChange={onChange}
        required={required} disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500
          focus:border-transparent transition bg-white
          disabled:bg-gray-100 cursor-pointer
          ${error ? 'border-red-400' : 'border-gray-300'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}