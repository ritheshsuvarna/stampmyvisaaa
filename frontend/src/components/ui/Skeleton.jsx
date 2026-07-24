export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-gray-soft ${className}`} />;
}

export function ListItemSkeleton() {
  return (
    <div className="px-5 py-3 space-y-2 border-b border-border">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div>
      {Array.from({ length: 6 }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto w-full space-y-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
