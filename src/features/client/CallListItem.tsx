import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatTime, formatDuration, cn } from '@/lib/utils';
import type { Call } from '@/types/api';

interface CallListItemProps {
  call: Call;
  isActive: boolean;
  onClick: () => void;
}

export function CallListItem({ call, isActive, onClick }: CallListItemProps) {
  const initials = call.callerName
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2) ?? '?';

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3.5 cursor-pointer border-b border-slate-100 transition-colors flex gap-3',
        isActive
          ? 'bg-teal-50 border-l-[3px] border-l-teal-500'
          : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
      )}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-[11px] font-semibold text-teal-700 flex-shrink-0 mt-0.5">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-slate-900 truncate">{call.callerName}</span>
          <StatusBadge status={call.callStatus} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 truncate">{call.phoneNumber}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-slate-400">{formatDuration(call.startedAt, call.endedAt)}</span>
            <span className="text-[11px] text-slate-400">{formatTime(call.startedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
