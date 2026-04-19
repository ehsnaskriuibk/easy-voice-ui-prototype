import { useState } from 'react';
import { Play, Pause, Volume2, Send, MessageSquare, FileText, AlignLeft, Database, BarChart3 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TopBar } from '@/components/layout/TopBar';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatTime, formatDuration, cn } from '@/lib/utils';
import type { Call, CallStatus } from '@/types/api';

const TABS = [
  { id: 'summary', label: 'Summary', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'transcript', label: 'Transcript', icon: <AlignLeft className="w-3.5 h-3.5" /> },
  { id: 'data', label: 'Data', icon: <Database className="w-3.5 h-3.5" /> },
  { id: 'evaluation', label: 'Evaluation', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-3.5 h-3.5" /> },
];

const STATUSES: CallStatus[] = ['New', 'Done', 'ToDo'];

export function CallDetail({ call }: { call: Call }) {
  const { updateCallStatus, smsMessages, sendSMS, assistants } = useData();
  const { toast } = useToast();
  const [tab, setTab] = useState('summary');
  const [playing, setPlaying] = useState(false);
  const [smsInput, setSmsInput] = useState('');
  const [audioMode, setAudioMode] = useState<'mono' | 'stereo'>('mono');

  const messages = smsMessages[call.callId] ?? [];

  const handleSendSMS = () => {
    const text = smsInput.trim();
    if (!text) return;
    if (text.length > 160) { toast('Maximum 160 characters', 'error'); return; }
    sendSMS(call.callId, text);
    setSmsInput('');
    toast('Message sent');
  };

  const handleStatusChange = (status: CallStatus) => {
    updateCallStatus(call.callId, status);
    toast(`Status updated to ${status}`);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title={call.callerName ?? 'Unknown'} subtitle={call.phoneNumber ?? ''}>
        {/* Interactive status dropdown */}
        <select
          value={call.callStatus}
          onChange={(e) => handleStatusChange(e.target.value as CallStatus)}
          className={cn(
            'text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer appearance-auto',
            call.callStatus === 'New' && 'bg-blue-50 text-blue-700',
            call.callStatus === 'Done' && 'bg-emerald-50 text-emerald-700',
            call.callStatus === 'ToDo' && 'bg-amber-50 text-amber-700',
          )}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {call.callCategory && (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{call.callCategory}</span>
        )}
        <span className="text-xs text-slate-400 ml-auto">
          {formatTime(call.startedAt)} · {formatDuration(call.startedAt, call.endedAt)}
        </span>
      </TopBar>

      <div className="flex gap-0 border-b border-slate-200/80 bg-white px-6 flex-shrink-0">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            tab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          )}>{t.icon}{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'summary' && (
          <div className="max-w-3xl">
            {/* Audio player */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center gap-4 mb-5">
              <button onClick={() => setPlaying(!playing)} className="w-10 h-10 bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1">
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: playing ? '65%' : '35%' }} /></div>
                <div className="flex justify-between mt-1 text-xs text-slate-400"><span>{playing ? '2:06' : '1:08'}</span><span>3:12</span></div>
              </div>
              <Volume2 className="w-4 h-4 text-slate-400" />
              <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
                <button onClick={() => setAudioMode('mono')} className={cn('px-2.5 py-1 rounded-md text-xs font-medium transition-all', audioMode === 'mono' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400')}>Mono</button>
                <button onClick={() => setAudioMode('stereo')} className={cn('px-2.5 py-1 rounded-md text-xs font-medium transition-all', audioMode === 'stereo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400')}>Stereo</button>
              </div>
            </div>
            {call.summary && (
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 mb-5">
                <p className="text-sm font-medium text-slate-900 mb-2">Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed">{call.summary}</p>
              </div>
            )}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5">
              <p className="text-sm font-medium text-slate-900 mb-3">Call info</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400 text-xs block mb-0.5">Ended reason</span><span className="text-slate-900 font-medium">{call.endedReason ?? '—'}</span></div>
                <div><span className="text-slate-400 text-xs block mb-0.5">Progress</span><span className="text-slate-900 font-medium">{call.callProgressStatus ?? '—'}</span></div>
                <div><span className="text-slate-400 text-xs block mb-0.5">Call number</span><span className="text-slate-900 font-medium">#{call.assistantCallNumber}</span></div>
                <div><span className="text-slate-400 text-xs block mb-0.5">Assistant</span><span className="text-slate-900 font-medium">{assistants.find((a) => a.id === call.assistantId)?.name ?? '—'}</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'transcript' && (
          <div className="max-w-3xl bg-white rounded-xl border border-slate-200/80 p-5">
            {(call.transcript?.split('\n').filter(Boolean) ?? []).length > 0 ? (
              <div className="space-y-3">
                {call.transcript!.split('\n').filter(Boolean).map((line, i) => {
                  const ci = line.indexOf(': ');
                  const speaker = ci > -1 ? line.slice(0, ci) : '';
                  const text = ci > -1 ? line.slice(ci + 2) : line;
                  const isAI = speaker === 'AI';
                  return (
                    <div key={i} className={cn('flex', isAI ? 'justify-start' : 'justify-end')}>
                      <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5', isAI ? 'bg-white border border-slate-200 rounded-tl-md' : 'bg-teal-600 text-white rounded-tr-md')}>
                        <p className={cn('text-xs font-semibold mb-1', isAI ? 'text-teal-600' : 'text-teal-100')}>{isAI ? 'AI Assistant' : 'Caller'}</p>
                        <p className={cn('text-sm leading-relaxed', isAI ? 'text-slate-700' : 'text-white')}>{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-sm text-slate-400 italic">No transcript available.</p>}
          </div>
        )}

        {tab === 'data' && (
          <div className="max-w-3xl bg-white rounded-xl border border-slate-200/80 p-5">
            <p className="text-sm font-medium text-slate-900 mb-3">Extracted data</p>
            {call.structuredData ? (
              <div className="space-y-2">
                {Object.entries(call.structuredData).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500">{k.replace(/_/g, ' ')}</span>
                    <span className="text-slate-900 font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 italic">No structured data for this call.</p>}
          </div>
        )}

        {tab === 'evaluation' && (
          <div className="max-w-3xl bg-white rounded-xl border border-slate-200/80 p-5">
            <p className="text-sm font-medium text-slate-900 mb-3">Success evaluation</p>
            {call.successEvaluation ? (
              <div className="space-y-2">
                {Object.entries(call.successEvaluation).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-900 font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 italic">No evaluation for this call.</p>}
          </div>
        )}

        {tab === 'sms' && (
          <div className="max-w-3xl bg-white rounded-xl border border-slate-200/80 p-5">
            <p className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> SMS messages
            </p>
            {messages.length > 0 ? (
              <div className="space-y-2 mb-4">
                {messages.map((msg, i) => (
                  <div key={i} className="bg-teal-50 rounded-lg px-4 py-2.5">
                    <p className="text-sm text-slate-700">{msg.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatTime(msg.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic mb-4">No messages yet.</p>
            )}
            <div>
              <div className="flex gap-2">
                <input
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendSMS()}
                  placeholder="Type a message..."
                  className={cn(
                    'flex-1 px-3.5 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500',
                    smsInput.length > 160 ? 'border-red-300' : 'border-slate-200'
                  )}
                  maxLength={200}
                />
                <button
                  onClick={handleSendSMS}
                  disabled={!smsInput.trim() || smsInput.length > 160}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors',
                    smsInput.trim() && smsInput.length <= 160
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  )}
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
              <div className="flex justify-between mt-1.5">
                {smsInput.length > 160
                  ? <span className="text-xs text-red-500">Maximum 160 characters</span>
                  : <span />}
                <span className={cn('text-xs', smsInput.length > 160 ? 'text-red-500' : 'text-slate-400')}>
                  {smsInput.length}/160
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
