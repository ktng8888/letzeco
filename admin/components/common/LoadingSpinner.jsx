export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const spinner = (
    <div className={`animate-spin rounded-full border-4
      border-gray-200 border-t-green-500 ${sizes[size]}`} />
  );
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        {spinner}
      </div>
    );
  }
  return <div className="flex items-center justify-center p-8">{spinner}</div>;
}