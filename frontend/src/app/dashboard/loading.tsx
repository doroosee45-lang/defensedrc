export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="h-16 border-b border-[#1e321e] bg-[#0a110a] flex items-center px-6 gap-4 flex-shrink-0">
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-56 bg-[#1e321e] rounded-md animate-pulse" />
          <div className="h-3 w-40 bg-[#1e321e]/60 rounded-md animate-pulse" />
        </div>
        <div className="h-8 w-28 bg-[#1e321e] rounded-lg animate-pulse" />
      </div>

      {/* Body skeleton */}
      <div className="flex-1 overflow-hidden p-4 lg:p-6 space-y-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[#141e14] border border-[#1e321e] rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Main card */}
        <div className="h-12 bg-[#141e14] border border-[#1e321e] rounded-xl animate-pulse" />
        <div className="flex-1 bg-[#141e14] border border-[#1e321e] rounded-xl animate-pulse" style={{ height: 320 }} />
        <div className="h-32 bg-[#141e14] border border-[#1e321e] rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
