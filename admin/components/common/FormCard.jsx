export default function FormCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200
      shadow-sm ${className}`}>
      {children}
    </div>
  );
}