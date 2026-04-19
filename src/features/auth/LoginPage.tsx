import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/api';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'client', label: 'Client', desc: 'Single assistant and phone number. View your own calls and configuration.' },
  { role: 'tenant', label: 'Tenant', desc: 'Manage multiple assistants, phone numbers, and users within your account.' },
  { role: 'admin', label: 'Admin', desc: 'Platform-wide access to all tenants, assistants, and system settings.' },
];

export function LoginPage() {
  const { login } = useAuth();
  const [selected, setSelected] = useState<UserRole>('client');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <img src="/logo.png" alt="EasyVoice" className="w-12 h-12 rounded-xl object-cover" />
            <span className="text-2xl font-semibold text-slate-900">EasyVoice</span>
          </div>
          <p className="text-slate-500 text-sm">Choose a role to explore the dashboard</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex flex-col gap-2 mb-6">
            {ROLES.map(({ role, label, desc }) => (
              <label
                key={role}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all border-2',
                  selected === role
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-slate-200/80 hover:border-slate-300'
                )}
              >
                <input
                  type="radio"
                  name="role"
                  checked={selected === role}
                  onChange={() => setSelected(role)}
                  className="accent-teal-600 mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={() => login(selected)}
            className="w-full bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm shadow-teal-500/20"
          >
            Enter dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
