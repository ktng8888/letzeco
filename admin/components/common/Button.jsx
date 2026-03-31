import { Loader2 } from 'lucide-react';

export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  isLoading = false, disabled = false, className = ''
}) {
  const variants = {
    primary:   'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger:    'bg-red-500 hover:bg-red-600 text-white',
    outline:   'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost:     'hover:bg-gray-100 text-gray-600',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg
        font-medium transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}