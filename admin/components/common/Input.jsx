export default function Input({
  label, name, type = 'text', value, onChange,
  placeholder, required = false, error, hint,
  disabled = false, className = ''
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        required={required} disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500
          focus:border-transparent transition
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white'}`}
      />
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}