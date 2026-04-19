import { useMemo } from 'react';
import { Bot, PhoneCall, Users } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useData } from '@/context/DataContext';
import { ASSISTANT_TENANT_MAP } from '@/lib/mockData';
import { formatTime } from '@/lib/utils';
import type { Tenant } from '@/types/api';

export function TenantDetail({ tenant }: { tenant: Tenant }) {
  const { calls, assistants } = useData();
  const tenantAids = useMemo(() => Object.entries(ASSISTANT_TENANT_MAP).filter(([, t]) => t === tenant.id).map(([a]) => a), [tenant.id]);
  const tenantCalls = useMemo(() => calls.filter((c) => c.assistantId && tenantAids.includes(c.assistantId)), [calls, tenantAids]);
  const tenantAssistants = useMemo(() => assistants.filter((a) => tenantAids.includes(a.id)), [assistants, tenantAids]);

  return (
    <div className="flex flex-col h-full">
      <TopBar title={tenant.name} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><Bot className="w-5 h-5 text-teal-600" /></div>
              <div><p className="text-xl font-semibold text-slate-900">{tenant.assistantCount}</p><p className="text-xs text-slate-500">Assistants</p></div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><PhoneCall className="w-5 h-5 text-teal-600" /></div>
              <div><p className="text-xl font-semibold text-slate-900">{tenantCalls.length}</p><p className="text-xs text-slate-500">Total calls</p></div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><Users className="w-5 h-5 text-teal-600" /></div>
              <div><p className="text-xl font-semibold text-slate-900">{tenant.userCount}</p><p className="text-xs text-slate-500">Users</p></div>
            </div>
          </div>

          {/* Assistants */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-base font-medium text-slate-900">Assistants</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Name</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Pipeline</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Calls</th>
                </tr>
              </thead>
              <tbody>
                {tenantAssistants.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{a.name}</td>
                    <td className="px-5 py-3 text-slate-500">
                      <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">{typeof a.voice_pipeline === 'string' ? a.voice_pipeline : 'custom'}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{calls.filter((c) => c.assistantId === a.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent calls */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-base font-medium text-slate-900">Recent calls</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Caller</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Assistant</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Time</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenantCalls.slice(0, 5).map((c) => (
                  <tr key={c.callId} className="border-b border-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">{c.callerName}</td>
                    <td className="px-5 py-3 text-slate-500">{assistants.find((a) => a.id === c.assistantId)?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{formatTime(c.startedAt)}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.callStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
