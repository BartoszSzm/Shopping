export default function Loading() {
  return (
    <div className="grid grid-cols-5 gap-y-4 items-center animate-pulse">
      {/* Header */}
      <div />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-24" />
      ))}
      <div className="h-8 bg-gray-200 rounded w-8 justify-self-end" />

      <hr className="col-span-5 border-gray-200" />

      {/* Rows */}
      {[...Array(6)].map((_, rowIndex) => (
        <div key={rowIndex} className="contents">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-6" />
          <div className="h-8 bg-gray-200 rounded w-8 justify-self-end" />
        </div>
      ))}
    </div>
  );
}
