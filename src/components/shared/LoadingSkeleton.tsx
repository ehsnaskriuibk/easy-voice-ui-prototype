import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Bone({ className }: SkeletonProps) {
  return <div className={cn('bg-slate-200 rounded animate-pulse', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
      <div className="flex items-start gap-4">
        <Bone className="w-11 h-11 rounded-xl" />
        <div className="flex-1">
          <Bone className="h-6 w-16 mb-2" />
          <Bone className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <Bone className="h-4 w-28" />
            <Bone className="h-5 w-14 rounded-full" />
          </div>
          <Bone className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5">
      <Bone className="h-4 w-28 mb-2" />
      <Bone className="h-3 w-20 mb-4" />
      <Bone className="h-[180px] w-full rounded-lg" />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="p-6">
      <Bone className="h-12 w-full rounded-xl mb-5" />
      <Bone className="h-24 w-full rounded-xl mb-5" />
      <div className="grid grid-cols-2 gap-4">
        <Bone className="h-32 rounded-xl" />
        <Bone className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
