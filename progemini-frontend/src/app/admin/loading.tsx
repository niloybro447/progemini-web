export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-full h-full w-full py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
