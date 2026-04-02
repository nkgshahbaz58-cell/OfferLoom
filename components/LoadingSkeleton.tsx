export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 px-4 md:px-8 py-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-8 bg-netflix-card-bg rounded animate-pulse w-32" />
          <div className="flex gap-4 overflow-x-hidden">
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="flex-shrink-0 w-32 md:w-48 h-48 md:h-72 bg-netflix-card-bg rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
