import { useState, useMemo } from 'react';
import { PhoneCall, PhoneIncoming, CheckCircle2, Clock, Bot, AlertCircle } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useData } from '@/context/DataContext';
import { TIMELINE_DATA } from '@/lib/mockData';
import { formatTime, formatDuration, cn } from '@/lib/utils';
import { TEAL, CHART_COLORS } from '@/lib/constants';

interface Props { onNavigateCalls: () => void; onNavigateAssistant: () => void; }

export function ClientDashboard({ onNavigateCalls, onNavigateAssistant }: Props) {
  const { calls } = useData();
  const [range, setRange] = useState(30);

  const clientCalls = useMemo(() => calls.filter((c) => c.assistantId === 'a1'), [calls]);
  const newCount = clientCalls.filter((c) => c.callStatus === 'New').length;
  const doneCount = clientCalls.filter((c) => c.callStatus === 'Done').length;
  const todoCount = clientCalls.filter((c) => c.callStatus === 'ToDo').length;
  const chartData = useMemo(() => TIMELINE_DATA.slice(-range), [range]);

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-5">
        <div><p className="text-lg font-medium text-slate-900">Dashboard overview</p><p className="text-sm text-slate-400">Monitor your assistant and call performance</p></div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[{ v: 7, l: '7d' }, { v: 30, l: '30d' }, { v: 90, l: '90d' }].map(({ v, l }) => (
            <button key={v} onClick={() => setRange(v)} className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-all', range === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button onClick={onNavigateCalls} className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4 hover:border-teal-300 hover:shadow-sm transition-all text-left">
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center"><PhoneIncoming className="w-5 h-5 text-teal-600" /></div>
          <div><p className="text-sm font-semibold text-slate-900">View calls</p><p className="text-xs text-slate-500">Browse recent call history</p></div>
        </button>
        <button onClick={onNavigateAssistant} className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4 hover:border-teal-300 hover:shadow-sm transition-all text-left">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center"><Bot className="w-5 h-5 text-purple-600" /></div>
          <div><p className="text-sm font-semibold text-slate-900">Configure assistant</p><p className="text-xs text-slate-500">Edit greetings and prompts</p></div>
        </button>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-sm font-semibold text-slate-900">Pending follow-ups</p><p className="text-xs text-slate-500">{todoCount} calls need attention</p></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total calls" value={clientCalls.length} icon={<PhoneCall className="w-5 h-5" />} trend={12} sub="This month" />
        <StatCard label="New" value={newCount} icon={<PhoneIncoming className="w-5 h-5" />} trend={0.3} />
        <StatCard label="Done" value={doneCount} icon={<CheckCircle2 className="w-5 h-5" />} trend={-2.1} />
        <StatCard label="To do" value={todoCount} icon={<Clock className="w-5 h-5" />} trend={8.2} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div><p className="text-base font-medium text-slate-900">Call volume</p><p className="text-xs text-slate-400">Calls per day</p></div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={TEAL[400]} stopOpacity={0.15} /><stop offset="95%" stopColor={TEAL[400]} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} /><Area type="monotone" dataKey="calls" stroke={TEAL[500]} strokeWidth={2} fill="url(#tg)" dot={false} /></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4"><div><p className="text-base font-medium text-slate-900">Call duration</p><p className="text-xs text-slate-400">Avg seconds per day</p></div></div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 6)} /><YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e2e8f0' }} /><Line type="monotone" dataKey="avgDurationSeconds" stroke={CHART_COLORS.purple} strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div><p className="text-base font-medium text-slate-900">Recent calls</p><p className="text-xs text-slate-400 mt-0.5">Latest activity</p></div>
          <button onClick={onNavigateCalls} className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">View all</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-100"><th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Caller</th><th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Time</th><th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Duration</th><th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Status</th><th className="text-left px-5 py-2.5 text-xs font-medium text-slate-400 uppercase">Category</th></tr></thead>
          <tbody>{clientCalls.slice(0, 5).map((c) => (
            <tr key={c.callId} className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer" onClick={onNavigateCalls}>
              <td className="px-5 py-3 font-medium text-slate-900">{c.callerName}</td><td className="px-5 py-3 text-slate-500">{formatTime(c.startedAt)}</td><td className="px-5 py-3 text-slate-500">{formatDuration(c.startedAt, c.endedAt)}</td><td className="px-5 py-3"><StatusBadge status={c.callStatus} /></td><td className="px-5 py-3 text-slate-500">{c.callCategory ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
