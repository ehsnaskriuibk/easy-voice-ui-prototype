import { useState } from 'react';
import { Trash2, CheckCircle2, Mail, PhoneForwarded, Grid3X3, MapPin, Clock, Wrench, HelpCircle, Database, BarChart3, Server, Tag } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { INPUT_CLASS, SMALL_INPUT_CLASS, DAYS_OF_WEEK } from '@/lib/constants';
import type { AssistantConfig as AC, EmailSummaryAction, CallForwardingAction, DialMenuOption, Service, FAQItem, FlatSchemaEntry, Category, MCPServer, OpeningTimeSlot } from '@/types/api';
import { isValidEmail, isValidPhone, isValidFieldName, isValidUrl } from '@/lib/validators';

import { Settings, Zap, Building, Cog } from 'lucide-react';

const TABS = [
  { id: 'general', label: 'General', icon: <Settings className="w-3.5 h-3.5" /> },
  { id: 'actions', label: 'Actions', icon: <Zap className="w-3.5 h-3.5" /> },
  { id: 'business', label: 'Business', icon: <Building className="w-3.5 h-3.5" /> },
  { id: 'advanced', label: 'Advanced', icon: <Cog className="w-3.5 h-3.5" /> },
];

interface AssistantConfigProps {
  assistantId: string;
  onDelete?: () => void;
}

export function AssistantConfig({ assistantId, onDelete }: AssistantConfigProps) {
  const { assistants, updateAssistant } = useData();
  const { toast } = useToast();
  const a = assistants.find((x) => x.id === assistantId);
  const [tab, setTab] = useState('general');
  const [dirty, setDirty] = useState(false);

  if (!a) return <p className="p-6 text-slate-400">Assistant not found.</p>;

  const update = (updater: (draft: AC) => void) => {
    updateAssistant(assistantId, (prev) => { updater(prev); return prev; });
    setDirty(true);
  };

  const handleSave = () => { setDirty(false); toast('Changes saved'); };

  return (
    <div className="flex flex-col h-full">
      <TopBar title={a.name}>
        {dirty && <span className="text-xs text-amber-500 ml-4">Unsaved changes</span>}
        {onDelete && (
          <button onClick={onDelete} className="ml-3 px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        )}
        <button onClick={handleSave} className="ml-2 px-5 py-2 bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-teal-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Save changes
        </button>
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
        <div className="max-w-2xl">
          {tab === 'general' && <GeneralTab a={a} update={update} />}
          {tab === 'actions' && <ActionsTab a={a} update={update} />}
          {tab === 'business' && <BusinessTab a={a} update={update} />}
          {tab === 'advanced' && <AdvancedTab a={a} update={update} />}
        </div>
      </div>
    </div>
  );
}

type Updater = (fn: (a: AC) => void) => void;
function Card({ title, desc, icon, children }: { title: string; desc?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        {icon && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">{icon}</div>}
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-5"><label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>{children}</div>;
}
function Trash({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"><Trash2 className="w-4 h-4" /></button>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2 mb-2">{children}</div>;
}

// ── Helper: Button Group Component ──────────────────────
function ButtonGroup({ options, value, onChange, size = 'md', variant = 'spaced' }: { options: string[]; value: string; onChange: (v: string) => void; size?: 'sm' | 'md'; variant?: 'spaced' | 'segmented' }) {
  const isSmall = size === 'sm';
  const isSegmented = variant === 'segmented';
  return (
    <div className={cn('flex', isSegmented ? 'gap-0 bg-slate-100 rounded-lg p-1 inline-flex' : 'gap-2 flex-wrap')}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'font-medium transition-all',
            isSegmented ? 'rounded-md' : 'rounded-lg border',
            value === opt
              ? isSegmented ? 'bg-white text-slate-900 shadow-sm' : 'bg-teal-600 text-white border-teal-600'
              : isSegmented ? 'text-slate-600 hover:text-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:border-teal-300',
            isSmall ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
            !isSegmented && 'border'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── General ──────────────────────
function GeneralTab({ a, update }: { a: AC; update: Updater }) {
  const [vpMode, setVpMode] = useState<'preset' | 'custom'>(typeof a.voice_pipeline === 'string' || a.voice_pipeline === null ? 'preset' : 'custom');
  const vp = typeof a.voice_pipeline === 'object' ? a.voice_pipeline : null;
  const ttsProvider = vp?.tts?.provider ?? 'azure';

  return <>
    <Field label="Name"><input value={a.name} onChange={(e) => update((d) => { d.name = e.target.value; })} className={INPUT_CLASS} /></Field>
    <Field label="Voice pipeline">
      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer"><input type="radio" checked={vpMode === 'preset'} onChange={() => setVpMode('preset')} className="accent-teal-600" /> Preset</label>
        <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer"><input type="radio" checked={vpMode === 'custom'} onChange={() => setVpMode('custom')} className="accent-teal-600" /> Custom</label>
      </div>
      {vpMode === 'preset' ? (
        <div className="inline-block px-3.5 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-300">
          {typeof a.voice_pipeline === 'string' ? a.voice_pipeline : 'default-de'}
        </div>
      ) : (
        <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          {/* Row 1: Speech to Text */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Speech to Text</p>
              <ButtonGroup options={['azure', 'gladia']} value={vp?.stt?.provider ?? 'azure'} onChange={(v) => update((d) => { if (typeof d.voice_pipeline !== 'object' || !d.voice_pipeline) d.voice_pipeline = { llm: { provider: 'azure' } }; d.voice_pipeline.stt = { ...(d.voice_pipeline.stt || {}), provider: v as any }; })} size="sm" variant="segmented" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Language</p>
              <ButtonGroup options={['de-AT', 'de-DE', 'en-US', 'en-GB']} value={vp?.stt?.language ?? 'de-AT'} onChange={(v) => update((d) => { if (typeof d.voice_pipeline !== 'object' || !d.voice_pipeline) d.voice_pipeline = { llm: { provider: 'azure' } }; if (!d.voice_pipeline.stt) d.voice_pipeline.stt = { provider: 'azure' }; d.voice_pipeline.stt = { ...d.voice_pipeline.stt, language: v }; })} size="sm" variant="segmented" />
            </div>
          </div>
          {/* Row 2: Language Model */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Language Model</p>
            <div className="inline-block px-3.5 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300">Azure</div>
          </div>
          {/* Row 3: Text to Speech */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Text to Speech</p>
              <ButtonGroup options={['azure', 'cartesia']} value={ttsProvider} onChange={(v) => update((d) => { if (typeof d.voice_pipeline !== 'object' || !d.voice_pipeline) d.voice_pipeline = { llm: { provider: 'azure' } }; d.voice_pipeline.tts = { ...(d.voice_pipeline.tts || {}), provider: v as any }; })} size="sm" variant="segmented" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Voice</p>
              {ttsProvider === 'azure' ? (
                <ButtonGroup options={['alloy', 'nova', 'shimmer']} value={vp?.tts?.voice ?? 'alloy'} onChange={(v) => update((d) => { if (typeof d.voice_pipeline !== 'object' || !d.voice_pipeline) d.voice_pipeline = { llm: { provider: 'azure' } }; if (!d.voice_pipeline.tts) d.voice_pipeline.tts = { provider: 'azure' }; d.voice_pipeline.tts = { ...d.voice_pipeline.tts, voice: v }; })} size="sm" variant="segmented" />
              ) : (
                <ButtonGroup options={['british-lady', 'friendly-man']} value={vp?.tts?.voice ?? 'british-lady'} onChange={(v) => update((d) => { if (typeof d.voice_pipeline !== 'object' || !d.voice_pipeline) d.voice_pipeline = { llm: { provider: 'azure' } }; if (!d.voice_pipeline.tts) d.voice_pipeline.tts = { provider: 'azure' }; d.voice_pipeline.tts = { ...d.voice_pipeline.tts, voice: v }; })} size="sm" variant="segmented" />
              )}
            </div>
          </div>
        </div>
      )}
    </Field>
    <Field label="First message"><textarea value={a.firstMessage} onChange={(e) => update((d) => { d.firstMessage = e.target.value; })} rows={3} className={INPUT_CLASS} /></Field>
    <Field label="System prompt"><textarea value={a.prompt} onChange={(e) => update((d) => { d.prompt = e.target.value; })} rows={8} className={INPUT_CLASS} /></Field>
  </>;
}

// ── Actions ──────────────────────
function ActionsTab({ a, update }: { a: AC; update: Updater }) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState({ name: '', topic: '', email: '' });
  const [newFwd, setNewFwd] = useState({ name: '', topic: '', phone: '' });
  const [newDial, setNewDial] = useState({ title: '', type: 'continue' as string });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addEmail = () => {
    const errs: Record<string, string> = {};
    if (!newEmail.name.trim()) errs.emailName = 'Name is required';
    if (newEmail.email && !isValidEmail(newEmail.email)) errs.emailAddr = 'Invalid email format';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    update((d) => { d.core_actions.email_summary_actions.push({ name: newEmail.name, topic: newEmail.topic, destination_email: newEmail.email }); });
    setNewEmail({ name: '', topic: '', email: '' });
  };
  const removeEmail = (i: number) => { update((d) => { d.core_actions.email_summary_actions.splice(i, 1); }); toast('Action removed', 'info'); };

  const addFwd = () => {
    const errs: Record<string, string> = {};
    if (!newFwd.name.trim()) errs.fwdName = 'Name is required';
    if (newFwd.phone && !isValidPhone(newFwd.phone)) errs.fwdPhone = 'Must start with +';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    update((d) => { d.core_actions.call_forwarding_actions.push({ name: newFwd.name, topic: newFwd.topic, destination_phone_number: newFwd.phone }); });
    setNewFwd({ name: '', topic: '', phone: '' });
  };
  const removeFwd = (i: number) => { update((d) => { d.core_actions.call_forwarding_actions.splice(i, 1); }); toast('Action removed', 'info'); };

  const usedDigits = new Set((a.dial_menu?.options ?? []).map((o) => o.digit));
  const nextDigit = ['1','2','3','4','5','6','7','8','9','0'].find((d) => !usedDigits.has(d)) ?? null;
  const addDial = () => {
    if (!newDial.title.trim() || !nextDigit) return;
    const opt: DialMenuOption = { digit: nextDigit, title: newDial.title, continue_conversation: newDial.type === 'continue' || undefined, transfer_number: newDial.type === 'transfer' ? '' : undefined, information: newDial.type === 'info' ? '' : undefined };
    update((d) => { if (!d.dial_menu) d.dial_menu = { options: [] }; d.dial_menu.options.push(opt); });
    setNewDial({ title: '', type: 'continue' });
  };
  const removeDial = (i: number) => update((d) => { d.dial_menu?.options.splice(i, 1); });

  return <>
    <Card title="Email summary actions" desc="Send email summaries after calls matching a topic" icon={<Mail className="w-4 h-4" />}>
      {a.core_actions.email_summary_actions.map((ea, i) => (
        <Row key={i}>
          <input value={ea.name} onChange={(e) => update((d) => { d.core_actions.email_summary_actions[i].name = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-36 font-medium')} />
          <input value={ea.topic} onChange={(e) => update((d) => { d.core_actions.email_summary_actions[i].topic = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-28')} />
          <input value={ea.destination_email} onChange={(e) => update((d) => { d.core_actions.email_summary_actions[i].destination_email = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeEmail(i)} />
        </Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newEmail.name} onChange={(e) => { setNewEmail((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, emailName: '' })); }} placeholder="Name" className={cn(SMALL_INPUT_CLASS, 'w-36', errors.emailName && 'border-red-300')} />
        <input value={newEmail.topic} onChange={(e) => setNewEmail((p) => ({ ...p, topic: e.target.value }))} placeholder="Topic" className={cn(SMALL_INPUT_CLASS, 'w-28')} />
        <input value={newEmail.email} onChange={(e) => { setNewEmail((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, emailAddr: '' })); }} placeholder="Email" className={cn(SMALL_INPUT_CLASS, 'flex-1', errors.emailAddr && 'border-red-300')} />
        <button onClick={addEmail} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
      {(errors.emailName || errors.emailAddr) && <p className="text-xs text-red-500 mt-1">{errors.emailName || errors.emailAddr}</p>}
    </Card>
    <Card title="Call forwarding actions" desc="Forward calls matching a topic to a phone number" icon={<PhoneForwarded className="w-4 h-4" />}>
      {a.core_actions.call_forwarding_actions.map((ca, i) => (
        <Row key={i}>
          <input value={ca.name} onChange={(e) => update((d) => { d.core_actions.call_forwarding_actions[i].name = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-36 font-medium')} />
          <input value={ca.topic} onChange={(e) => update((d) => { d.core_actions.call_forwarding_actions[i].topic = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-28')} />
          <input value={ca.destination_phone_number} onChange={(e) => update((d) => { d.core_actions.call_forwarding_actions[i].destination_phone_number = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeFwd(i)} />
        </Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newFwd.name} onChange={(e) => { setNewFwd((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, fwdName: '' })); }} placeholder="Name" className={cn(SMALL_INPUT_CLASS, 'w-36', errors.fwdName && 'border-red-300')} />
        <input value={newFwd.topic} onChange={(e) => setNewFwd((p) => ({ ...p, topic: e.target.value }))} placeholder="Topic" className={cn(SMALL_INPUT_CLASS, 'w-28')} />
        <input value={newFwd.phone} onChange={(e) => { setNewFwd((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, fwdPhone: '' })); }} placeholder="Phone" className={cn(SMALL_INPUT_CLASS, 'flex-1', errors.fwdPhone && 'border-red-300')} />
        <button onClick={addFwd} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
      {(errors.fwdName || errors.fwdPhone) && <p className="text-xs text-red-500 mt-1">{errors.fwdName || errors.fwdPhone}</p>}
    </Card>
    <Card title="Dial menu" desc="IVR options callers hear. Each digit triggers one action." icon={<Grid3X3 className="w-4 h-4" />}>
      {(a.dial_menu?.options ?? []).map((opt, i) => {
        const actionType = opt.transfer_number != null ? 'transfer' : opt.continue_conversation ? 'continue' : 'info';
        return (
          <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 mb-4">
            {/* Header row: Digit + delete button */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-200">
              <div className="text-2xl font-bold text-slate-900">{opt.digit}</div>
              <button onClick={() => removeDial(i)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
            {/* Digit selector and Title row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Digit</p>
                <select value={opt.digit} onChange={(e) => update((d) => { if (d.dial_menu?.options[i]) d.dial_menu.options[i].digit = e.target.value; })} className={SMALL_INPUT_CLASS}>
                  {['1','2','3','4','5','6','7','8','9','0'].map((d) => {
                    const isTaken = (a.dial_menu?.options ?? []).some((o, idx) => idx !== i && o.digit === d);
                    return <option key={d} value={d} disabled={isTaken} style={{ opacity: isTaken ? 0.5 : 1 }}>{d}</option>;
                  })}
                </select>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-700 mb-2">Title</p>
                <input value={opt.title} onChange={(e) => update((d) => { if (d.dial_menu?.options[i]) d.dial_menu.options[i].title = e.target.value; })} className={SMALL_INPUT_CLASS} />
              </div>
            </div>
            {/* Action type segmented control */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">Action type</p>
              <div className="flex gap-0 bg-slate-100 rounded-lg p-1 inline-flex">
                {(['continue', 'transfer', 'info'] as const).map((t) => (
                  <button key={t} onClick={() => update((d) => {
                    if (!d.dial_menu?.options[i]) return;
                    d.dial_menu.options[i].continue_conversation = t === 'continue' ? true : undefined;
                    d.dial_menu.options[i].transfer_number = t === 'transfer' ? (d.dial_menu.options[i].transfer_number ?? '') : undefined;
                    d.dial_menu.options[i].information = t === 'info' ? (d.dial_menu.options[i].information ?? '') : undefined;
                  })} className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    actionType === t
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  )}>
                    {t === 'continue' ? 'Continue' : t === 'transfer' ? 'Transfer' : 'Info'}
                  </button>
                ))}
              </div>
            </div>
            {/* Conditional fields */}
            {actionType === 'transfer' && (
              <Field label="Transfer to phone">
                <input value={opt.transfer_number ?? ''} onChange={(e) => update((d) => { if (d.dial_menu?.options[i]) d.dial_menu.options[i].transfer_number = e.target.value; })} placeholder="+43..." className={INPUT_CLASS} />
              </Field>
            )}
            {actionType === 'info' && (
              <Field label="Information">
                <textarea value={opt.information ?? ''} onChange={(e) => update((d) => { if (d.dial_menu?.options[i]) d.dial_menu.options[i].information = e.target.value; })} rows={2} className={INPUT_CLASS} />
              </Field>
            )}
          </div>
        );
      })}
      {nextDigit ? (
        <div className="bg-white rounded-xl border border-slate-200/80 border-dashed p-4">
          {/* Header row: Next digit display */}
          <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="text-2xl font-bold text-slate-400">{nextDigit}</div>
          </div>
          {/* Digit and Title row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Digit</p>
              <div className="inline-block px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-300">{nextDigit}</div>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-700 mb-2">Title</p>
              <input value={newDial.title} onChange={(e) => setNewDial((p) => ({ ...p, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addDial()} placeholder="Option title" className={SMALL_INPUT_CLASS} />
            </div>
          </div>
          {/* Action type segmented control */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-2">Action type</p>
            <div className="flex gap-0 bg-slate-100 rounded-lg p-1 inline-flex">
              {(['continue', 'transfer', 'info'] as const).map((t) => (
                <button key={t} onClick={() => setNewDial((p) => ({ ...p, type: t }))} className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                  newDial.type === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}>
                  {t === 'continue' ? 'Continue' : t === 'transfer' ? 'Transfer' : 'Info'}
                </button>
              ))}
            </div>
          </div>
          {newDial.type === 'transfer' && (
            <Field label="Transfer to phone">
              <input placeholder="+43..." className={INPUT_CLASS} />
            </Field>
          )}
          {newDial.type === 'info' && (
            <Field label="Information">
              <textarea rows={2} placeholder="Information to provide" className={INPUT_CLASS} />
            </Field>
          )}
          <button onClick={addDial} className="w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors mt-3">Add dial option</button>
        </div>
      ) : <p className="text-xs text-slate-400 mt-3 italic">All digits in use</p>}
    </Card>
  </>;
}

// ── Business ──────────────────────
function BusinessTab({ a, update }: { a: AC; update: Updater }) {
  const { toast } = useToast();
  const loc = a.structured_context?.location;
  const times = a.structured_context?.opening_times;
  const services = a.structured_context?.services ?? [];
  const vip = a.structured_context?.vip_call_forwarding;
  const faqs = a.structured_context?.faq ?? [];
  const [newService, setNewService] = useState('');
  const [newVip, setNewVip] = useState('');
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });

  const ensureCtx = (d: AC) => { if (!d.structured_context) d.structured_context = { kind: '' }; };

  const addSlot = (day: string) => update((d) => {
    ensureCtx(d);
    if (!d.structured_context!.opening_times) d.structured_context!.opening_times = { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, saturday: null, sunday: null };
    const current = (d.structured_context!.opening_times as any)[day] as OpeningTimeSlot[] | null;
    (d.structured_context!.opening_times as any)[day] = [...(current ?? []), { start: '09:00', end: '17:00' }];
  });

  const removeSlot = (day: string, idx: number) => update((d) => {
    const slots = (d.structured_context?.opening_times as any)?.[day] as OpeningTimeSlot[] | null;
    if (slots) { slots.splice(idx, 1); if (slots.length === 0) (d.structured_context!.opening_times as any)[day] = null; }
  });

  const updateSlot = (day: string, idx: number, field: 'start' | 'end', value: string) => update((d) => {
    const slots = (d.structured_context?.opening_times as any)?.[day] as OpeningTimeSlot[] | null;
    if (slots?.[idx]) slots[idx][field] = value;
  });

  const toggleAccess = (field: 'is_barrier_free' | 'has_elevator' | 'has_free_parking') => update((d) => {
    ensureCtx(d);
    if (!d.structured_context!.location) return;
    d.structured_context!.location.additional_info[field] = !d.structured_context!.location.additional_info[field];
  });

  const addService = () => { if (!newService.trim()) return; update((d) => { ensureCtx(d); if (!d.structured_context!.services) d.structured_context!.services = []; d.structured_context!.services!.push({ name: newService }); }); setNewService(''); };
  const removeService = (i: number) => update((d) => { d.structured_context?.services?.splice(i, 1); });

  const addFaq = () => { if (!newFaq.q.trim()) return; update((d) => { ensureCtx(d); if (!d.structured_context!.faq) d.structured_context!.faq = []; d.structured_context!.faq!.push({ question: newFaq.q, answer: newFaq.a }); }); setNewFaq({ q: '', a: '' }); };
  const removeFaq = (i: number) => { update((d) => { d.structured_context?.faq?.splice(i, 1); }); toast('FAQ removed', 'info'); };

  const addVipNum = () => { if (!newVip.trim()) return; update((d) => { ensureCtx(d); if (!d.structured_context!.vip_call_forwarding) d.structured_context!.vip_call_forwarding = { forwarding_number: '', vip_phone_numbers: [] }; d.structured_context!.vip_call_forwarding!.vip_phone_numbers.push(newVip); }); setNewVip(''); };
  const removeVipNum = (i: number) => update((d) => { d.structured_context?.vip_call_forwarding?.vip_phone_numbers.splice(i, 1); });

  return <>
    <Card title="Location" desc="Business address and accessibility" icon={<MapPin className="w-4 h-4" />}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div><label className="text-xs text-slate-500 block mb-1">Address Line 1</label><input value={loc?.address.addressline1 ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.address.addressline1 = e.target.value; })} className={INPUT_CLASS} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Address Line 2</label><input value={loc?.address.addressline2 ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.address.addressline2 = e.target.value; })} className={INPUT_CLASS} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Postcode</label><input value={loc?.address.postcode ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.address.postcode = e.target.value; })} className={INPUT_CLASS} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">City</label><input value={loc?.address.city ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.address.city = e.target.value; })} className={INPUT_CLASS} /></div>
        <div className="col-span-2"><label className="text-xs text-slate-500 block mb-1">Country</label><input value={loc?.address.country ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.address.country = e.target.value; })} className={INPUT_CLASS} /></div>
      </div>
      <p className="text-sm font-medium text-slate-700 mb-3">Accessibility</p>
      <div className="flex gap-4 flex-wrap mb-4">
        {([['Barrier-free', 'is_barrier_free'], ['Elevator', 'has_elevator'], ['Free parking', 'has_free_parking']] as const).map(([label, field]) => (
          <div key={field} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleAccess(field)}>
            <div className={cn('w-9 h-[20px] rounded-full relative transition-colors', loc?.additional_info[field] ? 'bg-teal-500' : 'bg-slate-300')}>
              <div className={cn('w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] transition-all', loc?.additional_info[field] ? 'right-[2px]' : 'left-[2px]')} />
            </div>
            <span className="text-sm text-slate-600">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-slate-700 mb-3">Additional information</p>
      <div className="space-y-3">
        <div><label className="text-xs text-slate-500 block mb-1">Parking information</label><textarea value={loc?.additional_info.parking_information ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.additional_info.parking_information = e.target.value; })} rows={2} placeholder="e.g., Free parking available at rear" className={INPUT_CLASS} /></div>
        <div><label className="text-xs text-slate-500 block mb-1">Directions</label><textarea value={loc?.additional_info.directions ?? ''} onChange={(e) => update((d) => { if (d.structured_context?.location) d.structured_context.location.additional_info.directions = e.target.value; })} rows={2} placeholder="e.g., Located on Main Street, next to the blue building" className={INPUT_CLASS} /></div>
      </div>
    </Card>
    <Card title="Opening hours" desc="Define business hours for each day" icon={<Clock className="w-4 h-4" />}>
      {DAYS_OF_WEEK.map((day) => {
        const slots = (times as any)?.[day] as OpeningTimeSlot[] | null;
        return (
          <div key={day} className="flex gap-3 mb-3">
            <span className="text-sm font-medium text-slate-700 w-20 pt-2 capitalize">{day}</span>
            <div className="flex-1">
              {slots ? slots.map((sl, si) => (
                <div key={si} className="flex items-center gap-1.5 mb-1.5">
                  <input value={sl.start} onChange={(e) => updateSlot(day, si, 'start', e.target.value)} className={cn(SMALL_INPUT_CLASS, 'w-20')} />
                  <span className="text-slate-400 text-xs">—</span>
                  <input value={sl.end} onChange={(e) => updateSlot(day, si, 'end', e.target.value)} className={cn(SMALL_INPUT_CLASS, 'w-20')} />
                  <Trash onClick={() => removeSlot(day, si)} />
                </div>
              )) : <span className="text-sm text-slate-400 italic block pt-2 mb-1.5">Closed</span>}
              <button onClick={() => addSlot(day)} className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-medium rounded-md transition-colors">+ Add slot</button>
            </div>
          </div>
        );
      })}
    </Card>
    <Card title="Services" desc="Services your business offers" icon={<Wrench className="w-4 h-4" />}>
      {services.map((s, i) => (
        <Row key={i}><input value={s.name} onChange={(e) => update((d) => { if (d.structured_context?.services?.[i]) d.structured_context.services[i].name = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'flex-1')} /><Trash onClick={() => removeService(i)} /></Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newService} onChange={(e) => setNewService(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addService()} placeholder="Service name" className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
        <button onClick={addService} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
    </Card>
    <Card title="FAQ" desc="Questions and answers your assistant can reference" icon={<HelpCircle className="w-4 h-4" />}>
      {faqs.map((f, i) => (
        <Row key={i}>
          <div className="flex-1">
            <input value={f.question} onChange={(e) => update((d) => { if (d.structured_context?.faq?.[i]) d.structured_context.faq[i].question = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-full font-medium mb-1')} />
            <input value={f.answer} onChange={(e) => update((d) => { if (d.structured_context?.faq?.[i]) d.structured_context.faq[i].answer = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-full')} />
          </div>
          <Trash onClick={() => removeFaq(i)} />
        </Row>
      ))}
      <div className="mt-3">
        <input value={newFaq.q} onChange={(e) => setNewFaq((p) => ({ ...p, q: e.target.value }))} placeholder="Question" className={cn(SMALL_INPUT_CLASS, 'w-full mb-1.5')} />
        <div className="flex gap-2">
          <input value={newFaq.a} onChange={(e) => setNewFaq((p) => ({ ...p, a: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addFaq()} placeholder="Answer" className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <button onClick={addFaq} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
        </div>
      </div>
    </Card>
    <Card title="VIP call forwarding" desc="These callers skip the AI and get forwarded immediately" icon={<PhoneForwarded className="w-4 h-4" />}>
      <Field label="Forward to"><input value={vip?.forwarding_number ?? ''} onChange={(e) => update((d) => { ensureCtx(d); if (!d.structured_context!.vip_call_forwarding) d.structured_context!.vip_call_forwarding = { forwarding_number: '', vip_phone_numbers: [] }; d.structured_context!.vip_call_forwarding!.forwarding_number = e.target.value; })} placeholder="+43..." className={INPUT_CLASS} /></Field>
      <p className="text-xs text-slate-500 mb-2">VIP phone numbers</p>
      {(vip?.vip_phone_numbers ?? []).map((num, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input value={num} onChange={(e) => update((d) => { if (d.structured_context?.vip_call_forwarding) d.structured_context.vip_call_forwarding.vip_phone_numbers[i] = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeVipNum(i)} />
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <input value={newVip} onChange={(e) => setNewVip(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addVipNum()} placeholder="+43..." className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
        <button onClick={addVipNum} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
    </Card>
  </>;
}

// ── Advanced ──────────────────────
function AdvancedTab({ a, update }: { a: AC; update: Updater }) {
  const { toast } = useToast();
  const mcpServers = a.mcp_servers ?? [];
  const categories = a.structured_context?.additional_categories ?? [];
  const dataFields = a.structured_data_config?.output_schema.entries ?? [];
  const evalFields = a.success_evaluation_config?.output_schema.entries ?? [];
  const [newMcp, setNewMcp] = useState({ name: '', url: '' });
  const [newCat, setNewCat] = useState({ name: '', prompt: '' });
  const [newDataField, setNewDataField] = useState('');
  const [newEvalField, setNewEvalField] = useState('');
  const [mcpError, setMcpError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const addMcp = () => {
    if (!newMcp.name.trim()) { setMcpError('Name is required'); return; }
    if (newMcp.url && !isValidUrl(newMcp.url)) { setMcpError('URL must start with https://'); return; }
    setMcpError('');
    update((d) => { if (!d.mcp_servers) d.mcp_servers = []; d.mcp_servers.push({ name: newMcp.name, url: newMcp.url }); });
    setNewMcp({ name: '', url: '' });
  };
  const removeMcp = (i: number) => { update((d) => { d.mcp_servers?.splice(i, 1); }); toast('Server removed', 'info'); };

  const addCat = () => { if (!newCat.name.trim()) return; update((d) => { if (!d.structured_context) d.structured_context = { kind: '' }; if (!d.structured_context.additional_categories) d.structured_context.additional_categories = []; d.structured_context.additional_categories!.push({ name: newCat.name, prompt: newCat.prompt }); }); setNewCat({ name: '', prompt: '' }); };
  const removeCat = (i: number) => { update((d) => { d.structured_context?.additional_categories?.splice(i, 1); }); toast('Category removed', 'info'); };

  const addDataField = () => {
    if (!newDataField.trim()) return;
    if (!isValidFieldName(newDataField)) { setFieldError('No spaces — use letters, numbers, underscores'); return; }
    setFieldError('');
    update((d) => { if (!d.structured_data_config) d.structured_data_config = { output_schema: { schema_type: 'flat', entries: [] } }; d.structured_data_config.output_schema.entries.push({ field_name: newDataField, type: 'string' }); });
    setNewDataField('');
  };
  const removeDataField = (i: number) => { update((d) => { d.structured_data_config?.output_schema.entries.splice(i, 1); }); toast('Field removed', 'info'); };

  const addEvalField = () => {
    if (!newEvalField.trim()) return;
    if (!isValidFieldName(newEvalField)) { setFieldError('No spaces — use letters, numbers, underscores'); return; }
    setFieldError('');
    update((d) => { if (!d.success_evaluation_config) d.success_evaluation_config = { output_schema: { schema_type: 'flat', entries: [] } }; d.success_evaluation_config.output_schema.entries.push({ field_name: newEvalField, type: 'string' }); });
    setNewEvalField('');
  };
  const removeEvalField = (i: number) => { update((d) => { d.success_evaluation_config?.output_schema.entries.splice(i, 1); }); toast('Field removed', 'info'); };

  return <>
    <Card title="Structured data extraction" desc="Fields the AI extracts from each call transcript" icon={<Database className="w-4 h-4" />}>
      {dataFields.map((e, i) => (
        <Row key={i}>
          <input value={e.field_name} onChange={(ev) => update((d) => { d.structured_data_config!.output_schema.entries[i].field_name = ev.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-32')} />
          <select value={e.type ?? 'string'} onChange={(ev) => update((d) => { d.structured_data_config!.output_schema.entries[i].type = ev.target.value as any; })} className={cn(SMALL_INPUT_CLASS, 'w-24')}>
            <option>string</option><option>number</option><option>boolean</option><option>array</option><option>object</option>
          </select>
          <input value={e.description ?? ''} onChange={(ev) => update((d) => { d.structured_data_config!.output_schema.entries[i].description = ev.target.value; })} placeholder="Description" className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeDataField(i)} />
        </Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newDataField} onChange={(e) => { setNewDataField(e.target.value); setFieldError(''); }} onKeyDown={(e) => e.key === 'Enter' && addDataField()} placeholder="field_name" className={cn(SMALL_INPUT_CLASS, 'flex-1', fieldError && newDataField && 'border-red-300')} />
        <button onClick={addDataField} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
      {fieldError && newDataField && <p className="text-xs text-red-500 mt-1">{fieldError}</p>}
    </Card>
    <Card title="Success evaluation" desc="How the AI judges each call's outcome" icon={<BarChart3 className="w-4 h-4" />}>
      {evalFields.map((e, i) => (
        <Row key={i}>
          <input value={e.field_name} onChange={(ev) => update((d) => { d.success_evaluation_config!.output_schema.entries[i].field_name = ev.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-32')} />
          <select value={e.type ?? 'string'} onChange={(ev) => update((d) => { d.success_evaluation_config!.output_schema.entries[i].type = ev.target.value as any; })} className={cn(SMALL_INPUT_CLASS, 'w-24')}>
            <option>string</option><option>number</option><option>boolean</option>
          </select>
          <input value={e.description ?? ''} onChange={(ev) => update((d) => { d.success_evaluation_config!.output_schema.entries[i].description = ev.target.value; })} placeholder="Description" className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeEvalField(i)} />
        </Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newEvalField} onChange={(e) => { setNewEvalField(e.target.value); setFieldError(''); }} onKeyDown={(e) => e.key === 'Enter' && addEvalField()} placeholder="field_name" className={cn(SMALL_INPUT_CLASS, 'flex-1', fieldError && newEvalField && 'border-red-300')} />
        <button onClick={addEvalField} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
      {fieldError && newEvalField && <p className="text-xs text-red-500 mt-1">{fieldError}</p>}
    </Card>
    <Card title="MCP servers" desc="Connect to external services via Model Context Protocol" icon={<Server className="w-4 h-4" />}>
      {mcpServers.map((m, i) => (
        <Row key={i}>
          <input value={m.name} onChange={(e) => update((d) => { if (d.mcp_servers?.[i]) d.mcp_servers[i].name = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-40')} />
          <input value={m.url} onChange={(e) => update((d) => { if (d.mcp_servers?.[i]) d.mcp_servers[i].url = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeMcp(i)} />
        </Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newMcp.name} onChange={(e) => { setNewMcp((p) => ({ ...p, name: e.target.value })); setMcpError(''); }} placeholder="Name" className={cn(SMALL_INPUT_CLASS, 'w-40', mcpError && 'border-red-300')} />
        <input value={newMcp.url} onChange={(e) => { setNewMcp((p) => ({ ...p, url: e.target.value })); setMcpError(''); }} onKeyDown={(e) => e.key === 'Enter' && addMcp()} placeholder="https://..." className={cn(SMALL_INPUT_CLASS, 'flex-1', mcpError?.includes('URL') && 'border-red-300')} />
        <button onClick={addMcp} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
      {mcpError && <p className="text-xs text-red-500 mt-1">{mcpError}</p>}
    </Card>
    <Card title="Additional categories" desc="Custom call categories with classification prompts" icon={<Tag className="w-4 h-4" />}>
      {categories.map((c, i) => (
        <Row key={i}>
          <input value={c.name} onChange={(e) => update((d) => { if (d.structured_context?.additional_categories?.[i]) d.structured_context.additional_categories[i].name = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'w-36')} />
          <input value={c.prompt} onChange={(e) => update((d) => { if (d.structured_context?.additional_categories?.[i]) d.structured_context.additional_categories[i].prompt = e.target.value; })} className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
          <Trash onClick={() => removeCat(i)} />
        </Row>
      ))}
      <div className="flex items-center gap-2 mt-3">
        <input value={newCat.name} onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className={cn(SMALL_INPUT_CLASS, 'w-36')} />
        <input value={newCat.prompt} onChange={(e) => setNewCat((p) => ({ ...p, prompt: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addCat()} placeholder="Prompt" className={cn(SMALL_INPUT_CLASS, 'flex-1')} />
        <button onClick={addCat} className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-600 text-xs font-semibold rounded-lg border border-teal-300">Add</button>
      </div>
    </Card>
  </>;
}
