import type { CallStatus } from '@/types/api';

const STYLES: Record<CallStatus, { bg: string; text: string; dot: string }> = {
  New: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  Done: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  ToDo: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
};

export function StatusBadge({ status }: { status: CallStatus }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
