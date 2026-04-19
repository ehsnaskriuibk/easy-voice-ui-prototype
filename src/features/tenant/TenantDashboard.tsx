import { useState, useMemo } from 'react';
import { PhoneCall, Bot, Phone, Clock } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useData } from '@/context/DataContext';
import { TIMELINE_DATA, ASSISTANT_TENANT_MAP } from '@/lib/mockData';
import { formatTime, cn } from '@/lib/utils';
import { TEAL, CHART_COLORS, PIE_COLORS } from '@/lib/constants';

export function TenantDashboard() {
  const { calls, assistants, phoneNumbers } = useData();
  const tenantAids = useMemo(() => Object.entries(ASSISTANT_TENANT_MAP).filter(([, t]) => t === 't1').map(([a]) => a), []);
  const tenantAssistants = useMemo(() => assistants.filter((a) => tenantAids.includes(a.id)), [assistants, tenantAids]);
  const tenantAssistantIds = useMemo(() => tenantAssistants.map((a) => a.id), [tenantAssistants]);

  const [selectedAssistants, setSelectedAssistants] = useState<Set<string>>(() => new Set(tenantAssistantIds));
  const [range, setRange] = useState(30);

  const tenantCalls = useMemo(
    () => calls.filter((c) => c.assistantId && tenantAssistantIds.includes(c.assistantId)),
    [calls, tenantAssistantIds]
  );

  const filteredCalls = useMemo(
    () => tenantCalls.filter((c) => c.assistantId && selectedAssistants.has(c.assistantId)),
    [tenantCalls, selectedAssistants]
  );

  const tenantPhones = useMemo(
    () => phoneNumbers.filter((p) => p.assistantId && tenantAssistantIds.includes(p.assistantId)),
    [phoneNumbers, tenantAssistantIds]
  );

  const todoCount = tenantCalls.filter((c) => c.callStatus === 'ToDo').length;
  const chartData = useMemo(() => TIMELINE_DATA.slice(-range), [range]);

  const statusData = useMemo(() => [
    { name: 'New', value: filteredCalls.filter((c) => c.callStatus === 'New').length },
    { name: 'Done', value: filteredCalls.filter((c) => c.callStatus === 'Done').length },
    { name: 'ToDo', value: filteredCalls.filter((c) => c.callStatus === 'ToDo').length },
  ], [filteredCalls]);

  const perAssistantData = useMemo(
    () => tenantAssistants.map((a) => ({
      name: a.name,
      count: calls.filter((c) => c.assistantId === a.id).length,
    })),
    [tenantAssistants, calls]
  );

  const maxCount = Math.max(...perAssistantData.map((d) => d.count), 1);

  const toggleAssistant = (id: string) => {
    setSelectedAssistants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-lg font-medium text-slate-900">Dashboard overview</p>
          <p className="text-sm text-slate-400">Performance across all assistants</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[{ v: 7, l: '7d' }, { v: 30, l: '30d' }, { v: 90, l: '90d' }].map(({ v, l }) => (
            <button key={v} onClick={() => setRange(v)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', range === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total calls" value={tenantCalls.length} icon={<PhoneCall className="w-5 h-5" />} trend={12} sub="This month" />
        <StatCard label="Assistants" value={tenantAssistants.length} icon={<Bot className="w-5 h-5" />} />
        <StatCard label="Phone numbers" value={tenantPhones.length} icon={<Phone className="w-5 h-5" />} />
        <StatCard label="To do" value={todoCount} icon={<Clock className="w-5 h-5" />} trend={8.2} />
      </div>

      {/* Assistant filter */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-slate-500">Filter:</span>
        {tenantAssistants.map((a) => (
          <label
            key={a.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors border ${
              selectedAssistants.has(a.id)
                ? 'bg-teal-50 text-teal-700 border-teal-300'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedAssistants.has(a.id)}
              onChange={() => toggleAssistant(a.id)}
              className="accent-teal-600 w-3 h-3"
            />
            {a.name}
          </label>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <p className="text-base font-medium text-slate-900 mb-0.5">Call volume</p>
          <p className="text-xs text-slate-400 mb-4">Calls per day</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs><linearGradient id="tgTenant" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={TEAL[400]} stopOpacity={0.15} /><stop offset="95%" stopColor={TEAL[400]} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="calls" stroke={TEAL[500]} strokeWidth={2} fill="url(#tgTenant)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <p className="text-base font-medium text-slate-900 mb-0.5">Call duration</p>
          <p className="text-xs text-slate-400 mb-4">Avg seconds per day</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="avgDurationSeconds" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-assistant + status distribution */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <p className="text-base font-medium text-slate-900 mb-4">Calls per assistant</p>
          <div className="space-y-3">
            {perAssistantData.map((d, i) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{d.name}</span>
                  <span className="font-medium text-slate-900">{d.count}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(d.count / maxCount) * 100}%`, background: i === 0 ? TEAL[500] : CHART_COLORS.blue }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <p className="text-base font-medium text-slate-900 mb-4">Status distribution</p>
          <div className="flex items-center justify-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-500">{s.name}</span>
                  <span className="font-medium text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <tr key={c.callId} className="border-b border-slate-50 hover:bg-slate-50/80">
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
  );
}
