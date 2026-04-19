import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { INPUT_CLASS } from '@/lib/constants';
import type { AssistantConfig } from '@/types/api';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'actions', label: 'Actions' },
  { id: 'business', label: 'Business' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'advanced', label: 'Advanced' },
];

interface Props {
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function CreateAssistantModal({ onClose, onCreated }: Props) {
  const { addAssistant } = useData();
  const { toast } = useToast();
  const [tab, setTab] = useState('general');
  const [name, setName] = useState('');
  const [pipeline, setPipeline] = useState('default-de');
  const [firstMessage, setFirstMessage] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = `a${Date.now()}`;
    const newAssistant: AssistantConfig = {
      id,
      name: name.trim(),
      voice_pipeline: pipeline,
      firstMessage: firstMessage.trim(),
      prompt: prompt.trim(),
      core_actions: { email_summary_actions: [], call_forwarding_actions: [] },
      dial_menu: null,
      structured_context: null,
      structured_data_config: null,
      success_evaluation_config: null,
      mcp_servers: [],
    };
    addAssistant(newAssistant);
    toast(`${name.trim()} created`);
    onCreated(id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-5 pb-0 flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">New assistant</p>
            <p className="text-sm text-slate-400 mt-0.5">Configure your new AI call assistant</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-0 border-b border-slate-200/80 px-6 mt-4">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            )}>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'general' && (
            <div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Reception Bot" className={INPUT_CLASS} />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Voice pipeline</label>
                <select value={pipeline} onChange={(e) => setPipeline(e.target.value)} className={INPUT_CLASS}>
                  <option>default-de</option><option>default-en</option><option>premium-de</option><option>premium-en</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First message</label>
                <textarea value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} placeholder="Hello! How can I help you today?" rows={3} className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">System prompt</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="You are a helpful assistant..." rows={5} className={INPUT_CLASS} />
              </div>
            </div>
          )}
          {tab !== 'general' && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400">Create the assistant first, then configure {tab} settings.</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()} className={cn(
            'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
            name.trim() ? 'bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-sm shadow-teal-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}>Create assistant</button>
        </div>
      </div>
    </div>
  );
}
