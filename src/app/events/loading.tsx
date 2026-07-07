import React from "react";

export default function EventsLoading() {
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden md:flex-row flex-col">
      {/* Mock Sidebar Skeleton */}
      <div className="hidden md:flex md:flex-col bg-blue-600 w-[85px] shrink-0 border-r border-blue-700/50 p-4 justify-between items-center h-full">
        <div className="flex flex-col gap-8 w-full items-center">
          <div className="h-8 w-8 bg-blue-500/80 rounded-lg animate-pulse" />
          <div className="flex flex-col gap-5 w-full items-center mt-4">
            <div className="h-6 w-6 bg-blue-500/80 rounded-md animate-pulse" />
            <div className="h-6 w-6 bg-blue-500/80 rounded-md animate-pulse" />
            <div className="h-6 w-6 bg-blue-500/80 rounded-md animate-pulse" />
            <div className="h-6 w-6 bg-blue-500/80 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-8 bg-blue-500/80 rounded-full animate-pulse" />
      </div>

      {/* Main Panel Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 md:p-8 bg-slate-50 justify-between">
        <div className="flex-1 flex flex-col rounded-2xl border border-slate-300 bg-white p-6 md:p-10 shadow-sm relative overflow-hidden">
          
          {/* Header Skeleton */}
          <div className="pb-6 border-b border-slate-300">
            <div className="h-5 w-24 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-8 w-44 bg-slate-200 rounded-md mt-3 animate-pulse" />
          </div>

          {/* Cards Area Skeleton */}
          <div className="mt-8 flex-1 relative flex flex-col justify-center items-center">
            
            {/* Background cards mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full opacity-35 select-none pointer-events-none">
              <div className="h-32 border border-slate-200 bg-slate-50 rounded-xl" />
              <div className="h-32 border border-slate-200 bg-slate-50 rounded-xl" />
              <div className="h-32 border border-slate-200 bg-slate-50 rounded-xl" />
            </div>

            {/* Circular Loading Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 bg-white/70 backdrop-blur-xs z-10">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin shadow-sm" />
              <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading events...</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
