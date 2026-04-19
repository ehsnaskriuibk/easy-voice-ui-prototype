import { useData } from '@/context/DataContext';
import { ASSISTANT_TENANT_MAP } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import type { Tenant } from '@/types/api';

interface Props {
  tenant: Tenant;
  isActive: boolean;
  onClick: () => void;
}

export function TenantListItem({ tenant, isActive, onClick }: Props) {
  const { calls } = useData();
  const aids = Object.entries(ASSISTANT_TENANT_MAP).filter(([, t]) => t === tenant.id).map(([a]) => a);
  const callCount = calls.filter((c) => c.assistantId && aids.includes(c.assistantId)).length;

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3.5 cursor-pointer border-b border-slate-100 transition-colors',
        isActive
          ? 'bg-teal-50 border-l-[3px] border-l-teal-500'
          : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
      )}
    >
      <p className="text-sm font-medium text-slate-900 mb-1">{tenant.name}</p>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>{tenant.assistantCount} assistants</span>
        <span>{callCount} calls</span>
        <span>{tenant.userCount} users</span>
      </div>
    </div>
  );
}
