export default function FormSection({ title, children }) {
  return (
    <div>
      <div className="flex items-center justify-between py-4 px-6 border-b">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}