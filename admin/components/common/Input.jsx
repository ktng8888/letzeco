'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label, name, type = 'text', value, onChange,
  placeholder, required = false, error, hint,
  disabled = false, className = ''
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          required={required} disabled={disabled}
          className={`w-full px-3 py-2 text-sm border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-green-500
            focus:border-transparent transition
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white'}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(current => !current)}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
