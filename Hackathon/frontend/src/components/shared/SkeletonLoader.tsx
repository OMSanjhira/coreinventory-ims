interface SkeletonLoaderProps {
  rows?: number;
  cols?: number;
}

const SkeletonLoader = ({ rows = 5, cols = 5 }: SkeletonLoaderProps) => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-50 rounded-t-xl px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton h-3 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-t border-gray-50 px-4 py-4 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton h-4 rounded flex-1" style={{ opacity: 1 - j * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="card p-6 animate-pulse space-y-3">
    <div className="skeleton h-4 w-1/3 rounded" />
    <div className="skeleton h-8 w-1/2 rounded" />
    <div className="skeleton h-3 w-2/3 rounded" />
  </div>
);

export default SkeletonLoader;
