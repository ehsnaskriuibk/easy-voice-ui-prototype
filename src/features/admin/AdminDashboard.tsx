import { useMemo, useState } from 'react';
import { PhoneCall, Bot, Phone, Building2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useData } from '@/context/DataContext';
import { TIMELINE_DATA, TENANTS, ASSISTANT_TENANT_MAP } from '@/lib/mockData';
import { formatTime, cn } from '@/lib/utils';
import { TEAL, CHART_COLORS } from '@/lib/constants';

export function AdminDashboard() {
  const { calls, assistants, phoneNumbers } = useData();
  const [range, setRange] = useState(30);
  const chartData = useMemo(() => TIMELINE_DATA.slice(-range), [range]);

  const tenantData = useMemo(
    () => TENANTS.map((t) => {
      const aids = Object.entries(ASSISTANT_TENANT_MAP).filter(([, tid]) => tid === t.id).map(([a]) => a);
      const tc = calls.filter((c) => c.assistantId && aids.includes(c.assistantId));
      return { ...t, calls: tc.length, newCalls: tc.filter((c) => c.callStatus === 'New').length };
    }),
    [calls]
  );

  const barColors = [TEAL[500], CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.amber];
  const maxCalls = Math.max(...tenantData.map((t) => t.calls), 1);

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-lg font-medium text-slate-900">Platform overview</p>
          <p className="text-sm text-slate-400">System-wide performance across all tenants</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[{ v: 7, l: '7d' }, { v: 30, l: '30d' }, { v: 90, l: '90d' }].map(({ v, l }) => (
            <button key={v} onClick={() => setRange(v)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', range === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total calls" value={calls.length} icon={<PhoneCall className="w-5 h-5" />} trend={12} sub="This month" />
        <StatCard label="Assistants" value={assistants.length} icon={<Bot className="w-5 h-5" />} />
        <StatCard label="Phone numbers" value={phoneNumbers.length} icon={<Phone className="w-5 h-5" />} />
        <StatCard label="Tenants" value={TENANTS.length} icon={<Building2 className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <p className="text-base font-medium text-slate-900 mb-0.5">Call volume</p>
          <p className="text-xs text-slate-400 mb-4">Platform-wide, calls per day</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="tgAdmin" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={TEAL[400]} stopOpacity={0.15} /><stop offset="95%" stopColor={TEAL[400]} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="calls" stroke={TEAL[500]} strokeWidth={2} fill="url(#tgAdmin)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <p className="text-base font-medium text-slate-900 mb-4">Calls per tenant</p>
          <div className="space-y-3">
            {tenantData.map((t, i) => (
              <div key={t.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{t.name}</span>
                  <span className="font-medium text-slate-900">{t.calls}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(t.calls / maxCalls) * 100}%`, background: barColors[i % barColors.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-base font-medium text-slate-900">Tenant overview</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Tenant</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Assistants</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Calls</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">New</th>
              <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Users</th>
            </tr>
          </thead>
          <tbody>
            {tenantData.map((t) => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                <td className="px-5 py-3 font-medium text-slate-900">{t.name}</td>
                <td className="px-5 py-3 text-slate-500">{t.assistantCount}</td>
                <td className="px-5 py-3 text-slate-500">{t.calls}</td>
                <td className="px-5 py-3 font-medium text-teal-600">{t.newCalls}</td>
                <td className="px-5 py-3 text-slate-500">{t.userCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
