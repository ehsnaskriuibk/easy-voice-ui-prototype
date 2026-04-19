import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';
import type { AssistantConfig } from '@/types/api';

interface Props {
  assistant: AssistantConfig;
  isActive: boolean;
  onClick: () => void;
}

export function AssistantListItem({ assistant, isActive, onClick }: Props) {
  const { calls, phoneNumbers } = useData();
  const callCount = calls.filter((c) => c.assistantId === assistant.id).length;
  const phone = phoneNumbers.find((p) => p.assistantId === assistant.id);
  const pipeline = typeof assistant.voice_pipeline === 'string' ? assistant.voice_pipeline : 'custom';

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
      <p className="text-sm font-medium text-slate-900 mb-0.5">{assistant.name}</p>
      <p className="text-xs text-slate-400 mb-1.5">{phone?.number ?? 'No phone'}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">{callCount} calls</span>
        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">{pipeline}</span>
      </div>
    </div>
  );
}
