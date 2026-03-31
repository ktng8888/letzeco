export default function Textarea({
  label, name, value, onChange, placeholder,
  required = false, rows = 4, disabled = false,
  error, className = ''
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        rows={rows} disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-green-500
          focus:border-transparent transition resize-none
          disabled:bg-gray-100
          ${error ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white'}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}