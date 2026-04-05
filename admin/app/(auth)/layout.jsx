export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0f172a' }}>
      {children}
    </div>
  );
}