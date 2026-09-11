/** Reusable shimmer skeleton for dashboard loading states.
 *  Each sub-route's loading.tsx simply re-exports one of these variants
 *  so Next.js can stream an instant placeholder while the RSC fetches data.
 */

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

/** Stat-cards row + three content columns — used by most admin/student pages */
export function DashboardPageSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-4 w-72" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Filters row */}
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-24" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
            <SkeletonBlock className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-48" />
              <SkeletonBlock className="h-3 w-32" />
            </div>
            <SkeletonBlock className="h-6 w-20 flex-shrink-0" />
            <SkeletonBlock className="h-8 w-24 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Simpler variant — header + one full-width content block (e.g. lists/profiles) */
export function ContentPageSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-64" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm space-y-3">
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-9 w-28 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Course-grid skeleton */
export function CoursesPageSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
        <SkeletonBlock className="h-10 w-32" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-9 w-24" />
        ))}
      </div>

      {/* Course cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <SkeletonBlock className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Profile page skeleton */
export function ProfilePageSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Avatar + name */}
      <div className="flex items-center gap-6">
        <SkeletonBlock className="h-24 w-24 rounded-full flex-shrink-0" />
        <div className="space-y-3">
          <SkeletonBlock className="h-7 w-48" />
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-6 w-24" />
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white rounded-xl shadow-sm p-6 grid md:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
