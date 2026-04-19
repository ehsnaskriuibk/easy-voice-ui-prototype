import { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, PhoneCall, Bot, Phone, Building2, Plus, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Sidebar, type NavItem } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ClientDashboard } from '@/features/client/ClientDashboard';
import { CallListItem } from '@/features/client/CallListItem';
import { CallDetail } from '@/features/client/CallDetail';
import { AssistantConfig } from '@/features/client/AssistantConfig';
import { TenantDashboard } from '@/features/tenant/TenantDashboard';
import { AssistantListItem } from '@/features/tenant/AssistantListItem';
import { CreateAssistantModal } from '@/features/tenant/CreateAssistantModal';
import { PhoneDetail } from '@/features/tenant/PhoneDetail';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { TenantListItem } from '@/features/admin/TenantListItem';
import { TenantDetail } from '@/features/admin/TenantDetail';
import { UsersList } from '@/features/admin/UsersList';
import { UserDetail } from '@/features/admin/UserDetail';
import { TENANTS, ASSISTANT_TENANT_MAP } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import type { UserRole, User } from '@/types/api';

// Mock users data
const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@example.com', name: 'Admin User', role: 'admin', tenantId: null },
  { id: 'u2', email: 'tenant@example.com', name: 'Tenant Manager', role: 'tenant', tenantId: 't1', tenantName: 'Acme Corp' },
  { id: 'u3', email: 'user@example.com', name: 'Client User', role: 'client', tenantId: 't1', tenantName: 'Acme Corp' },
  { id: 'u4', email: 'support@example.com', name: 'Support Staff', role: 'tenant', tenantId: 't2', tenantName: 'Tech Solutions' },
];

const NAV: Record<UserRole, NavItem[]> = {
  client: [
    { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
    { id: 'calls', icon: <PhoneCall className="w-4 h-4" />, label: 'Calls' },
    { id: 'assistant', icon: <Bot className="w-4 h-4" />, label: 'Assistant' },
  ],
  tenant: [
    { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
    { id: 'calls', icon: <PhoneCall className="w-4 h-4" />, label: 'Calls' },
    { id: 'assistants', icon: <Bot className="w-4 h-4" />, label: 'Assistants' },
    { id: 'phones', icon: <Phone className="w-4 h-4" />, label: 'Phones' },
  ],
  admin: [
    { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Overview' },
    { id: 'calls', icon: <PhoneCall className="w-4 h-4" />, label: 'Calls' },
    { id: 'assistants', icon: <Bot className="w-4 h-4" />, label: 'Assistants' },
    { id: 'phones', icon: <Phone className="w-4 h-4" />, label: 'Phones' },
    { id: 'tenants', icon: <Building2 className="w-4 h-4" />, label: 'Tenants' },
    { id: 'users', icon: <Users className="w-4 h-4" />, label: 'Users' },
  ],
};

const LIST_PAGES = new Set(['calls', 'assistants', 'phones', 'tenants', 'users']);
const STATUS_TABS = [
  { id: 'all', label: 'All' }, { id: 'New', label: 'New' },
  { id: 'Done', label: 'Done' }, { id: 'ToDo', label: 'ToDo' },
];

export function DashboardShell() {
  const { user, logout } = useAuth();
  const { calls, assistants, phoneNumbers, deleteAssistant } = useData();
  const { toast } = useToast();
  const role = user?.role ?? 'client';

  const [screen, setScreen] = useState('dashboard');
  const [selCall, setSelCall] = useState<string | null>(null);
  const [selAsst, setSelAsst] = useState<string | null>(null);
  const [selPhone, setSelPhone] = useState<string | null>(null);
  const [selTenant, setSelTenant] = useState<string | null>(null);
  const [selUser, setSelUser] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [prevRole, setPrevRole] = useState(role);

  if (role !== prevRole) {
    setPrevRole(role);
    setScreen('dashboard');
    setSelCall(null); setSelAsst(null); setSelPhone(null); setSelTenant(null); setSelUser(null);
    setSearch(''); setStatusF('all');
  }

  const nav = (id: string) => {
    setScreen(id);
    setSelCall(null); setSelAsst(null); setSelPhone(null); setSelTenant(null); setSelUser(null);
    setSearch(''); setStatusF('all');
  };

  const isList = LIST_PAGES.has(screen);

  // ── Scoped data ──────────────
  const scopedCalls = useMemo(() => {
    if (role === 'client') return calls.filter((c) => c.assistantId === 'a1');
    if (role === 'tenant') {
      const ids = Object.entries(ASSISTANT_TENANT_MAP).filter(([, t]) => t === 't1').map(([a]) => a);
      return calls.filter((c) => c.assistantId && ids.includes(c.assistantId));
    }
    return calls;
  }, [calls, role]);

  const filteredCalls = useMemo(() => {
    let r = scopedCalls;
    if (statusF !== 'all') r = r.filter((c) => c.callStatus === statusF);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.callerName?.toLowerCase().includes(q) || c.phoneNumber?.toLowerCase().includes(q));
    }
    return r;
  }, [scopedCalls, statusF, search]);

  const counts = useMemo(() => ({
    all: scopedCalls.length,
    New: scopedCalls.filter((c) => c.callStatus === 'New').length,
    Done: scopedCalls.filter((c) => c.callStatus === 'Done').length,
    ToDo: scopedCalls.filter((c) => c.callStatus === 'ToDo').length,
  }), [scopedCalls]);

  const scopedAssistants = useMemo(() => {
    if (role === 'client') return assistants.filter((a) => a.id === 'a1');
    if (role === 'tenant') {
      const tenantAids = Object.entries(ASSISTANT_TENANT_MAP).filter(([, t]) => t === 't1').map(([a]) => a);
      return assistants.filter((a) => tenantAids.includes(a.id));
    }
    return assistants;
  }, [role, assistants]);

  const selectedCall = useMemo(() => calls.find((c) => c.callId === selCall) ?? null, [calls, selCall]);
  const selectedAsst = useMemo(() => assistants.find((a) => a.id === selAsst) ?? null, [assistants, selAsst]);
  const selectedPhone = useMemo(() => phoneNumbers.find((p) => p.id === selPhone) ?? null, [phoneNumbers, selPhone]);
  const selectedTenant = useMemo(() => TENANTS.find((t) => t.id === selTenant) ?? null, [selTenant]);

  // ── Auto-select first item when navigating to list pages ──────────────
  useEffect(() => {
    if (screen === 'calls' && !selCall && filteredCalls.length > 0) {
      setSelCall(filteredCalls[0].callId);
    }
  }, [screen, selCall, filteredCalls]);

  useEffect(() => {
    if (screen === 'assistants' && !selAsst && scopedAssistants.length > 0) {
      setSelAsst(scopedAssistants[0].id);
    }
  }, [screen, selAsst, scopedAssistants]);

  useEffect(() => {
    if (screen === 'phones' && !selPhone && phoneNumbers.length > 0) {
      setSelPhone(phoneNumbers[0].id);
    }
  }, [screen, selPhone, phoneNumbers]);

  useEffect(() => {
    if (screen === 'tenants' && !selTenant && TENANTS.length > 0) {
      setSelTenant(TENANTS[0].id);
    }
  }, [screen, selTenant]);

  useEffect(() => {
    if (screen === 'users' && !selUser && TENANTS.length > 0) {
      // Using TENANTS as mock users data - in a real app this would be actual users
      setSelUser(TENANTS[0].id);
    }
  }, [screen, selUser]);

  // ── Delete assistant handler ──────────────
  const handleDeleteAssistant = () => {
    if (!deleteTarget) return;
    deleteAssistant(deleteTarget.id);
    toast(`${deleteTarget.name} deleted`, 'info');
    if (selAsst === deleteTarget.id) {
      const remaining = scopedAssistants.filter((a) => a.id !== deleteTarget.id);
      setSelAsst(remaining.length > 0 ? remaining[0].id : null);
    }
    setDeleteTarget(null);
  };

  // ── Search input ──────────────
  const SearchInput = ({ placeholder }: { placeholder: string }) => (
    <div className="relative">
      <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} className="w-full pl-9 pr-3 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
    </div>
  );

  // ── List panels ──────────────
  function ListPanel() {
    if (screen === 'calls') return (
      <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <p className="text-base font-medium text-slate-900 mb-3">Calls</p>
          <div className="mb-3"><SearchInput placeholder="Search calls..." /></div>
          <div className="flex gap-1">
            {STATUS_TABS.map((s) => (
              <button key={s.id} onClick={() => setStatusF(s.id)} className={cn('px-2.5 py-1 rounded-md text-xs font-medium', statusF === s.id ? 'bg-teal-50 text-teal-700' : 'text-slate-400 hover:bg-slate-50')}>
                {s.label} <span className="text-[10px] ml-0.5">{counts[s.id as keyof typeof counts]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredCalls.length ? filteredCalls.map((c) => (
            <CallListItem key={c.callId} call={c} isActive={c.callId === selCall} onClick={() => setSelCall(c.callId)} />
          )) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3"><PhoneCall className="w-5 h-5" /></div>
              <p className="text-sm font-medium text-slate-500 mb-1">{search || statusF !== 'all' ? 'No calls match your filters' : 'No calls yet'}</p>
              <p className="text-xs text-slate-400">{search || statusF !== 'all' ? 'Try adjusting your search or filters' : 'Calls will appear here once your assistant handles its first conversation.'}</p>
            </div>
          )}
        </div>
      </div>
    );

    if (screen === 'assistants') return (
      <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-medium text-slate-900">Assistants</p>
            {role !== 'client' && (
              <button onClick={() => setShowModal(true)} className="w-7 h-7 bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg flex items-center justify-center text-white shadow-sm shadow-teal-500/20"><Plus className="w-3.5 h-3.5" /></button>
            )}
          </div>
          <SearchInput placeholder="Search assistants..." />
        </div>
        <div className="flex-1 overflow-y-auto">
          {scopedAssistants.map((a) => (
            <AssistantListItem key={a.id} assistant={a} isActive={a.id === selAsst} onClick={() => setSelAsst(a.id)} />
          ))}
        </div>
      </div>
    );

    if (screen === 'phones') return (
      <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-slate-900">Phones</p>
            <button className="w-7 h-7 bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg flex items-center justify-center text-white shadow-sm shadow-teal-500/20"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {phoneNumbers.map((p) => (
            <div key={p.id} onClick={() => setSelPhone(p.id)} className={cn('px-4 py-3.5 cursor-pointer border-b border-slate-100 transition-colors', selPhone === p.id ? 'bg-teal-50 border-l-[3px] border-l-teal-500' : 'hover:bg-slate-50 border-l-[3px] border-l-transparent')}>
              <p className="text-sm font-medium text-slate-900 mb-1">{p.number}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{p.assistantId ? (assistants.find((a) => a.id === p.assistantId)?.name ?? 'Unknown') : <span className="italic">Unassigned</span>}</span>
                {p.assistantId
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
                  : <span className="text-[10px] text-slate-400 px-2 py-0.5 bg-slate-100 rounded-lg font-medium">Idle</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (screen === 'tenants') return (
      <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <p className="text-base font-medium text-slate-900 mb-3">Tenants</p>
          <SearchInput placeholder="Search tenants..." />
        </div>
        <div className="flex-1 overflow-y-auto">
          {TENANTS.map((t) => (
            <TenantListItem key={t.id} tenant={t} isActive={t.id === selTenant} onClick={() => setSelTenant(t.id)} />
          ))}
        </div>
      </div>
    );

    if (screen === 'users') return (
      <UsersList users={MOCK_USERS} selectedUserId={selUser ?? undefined} onSelect={setSelUser} />
    );

    return null;
  }

  // ── Detail panels ──────────────
  function DetailPanel() {
    if (screen === 'calls') return selectedCall ? <CallDetail call={selectedCall} /> : <Center icon={<PhoneCall className="w-6 h-6" />} t="Select a call" d="Choose a call from the list" />;
    if (screen === 'assistants') {
      if (!selectedAsst) return <Center icon={<Bot className="w-6 h-6" />} t="Select an assistant" d="Choose an assistant to configure" />;
      return (
        <AssistantConfig
          assistantId={selectedAsst.id}
          onDelete={role !== 'client' ? () => setDeleteTarget({ id: selectedAsst.id, name: selectedAsst.name }) : undefined}
        />
      );
    }
    if (screen === 'phones') return selectedPhone ? <PhoneDetail phone={selectedPhone} onDeleted={() => { const remaining = phoneNumbers.filter((p) => p.id !== selectedPhone.id); setSelPhone(remaining.length > 0 ? remaining[0].id : null); }} /> : <Center icon={<Phone className="w-6 h-6" />} t="Select a phone" d="Choose a number from the list" />;
    if (screen === 'tenants') return selectedTenant ? <TenantDetail tenant={selectedTenant} /> : <Center icon={<Building2 className="w-6 h-6" />} t="Select a tenant" d="Choose a tenant from the list" />;
    if (screen === 'users') {
      const selectedUser = MOCK_USERS.find((u) => u.id === selUser);
      return selectedUser ? <UserDetail user={selectedUser} /> : <Center icon={<Users className="w-6 h-6" />} t="Select a user" d="Choose a user from the list" />;
    }
    return null;
  }

  // ── Master-detail ──────────────
  if (isList) return (
    <div className="h-screen flex bg-slate-50/50 overflow-hidden">
      <Sidebar items={NAV[role]} active={screen} collapsed onNav={nav} onProfileClick={() => nav('profile')} />
      <ListPanel />
      <div className="flex-1 flex flex-col overflow-hidden"><DetailPanel /></div>
      {showModal && <CreateAssistantModal onClose={() => setShowModal(false)} onCreated={(id) => { setShowModal(false); setSelAsst(id); }} />}
      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.name}?`}
          message="This will remove all configuration for this assistant. Call records will not be affected."
          onConfirm={handleDeleteAssistant}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );

  // ── Full-width ──────────────
  return (
    <div className="h-screen flex bg-slate-50/50 overflow-hidden">
      <Sidebar items={NAV[role]} active={screen} collapsed={false} onNav={nav} onProfileClick={() => nav('profile')} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {screen === 'dashboard' && role === 'client' && <><TopBar title="Dashboard overview" /><div className="flex-1 overflow-y-auto"><ClientDashboard onNavigateCalls={() => nav('calls')} onNavigateAssistant={() => nav('assistant')} /></div></>}
        {screen === 'dashboard' && role === 'tenant' && <><TopBar title="Dashboard overview" /><div className="flex-1 overflow-y-auto"><TenantDashboard /></div></>}
        {screen === 'dashboard' && role === 'admin' && <><TopBar title="Platform overview" /><div className="flex-1 overflow-y-auto"><AdminDashboard /></div></>}
        {screen === 'assistant' && role === 'client' && <AssistantConfig assistantId="a1" />}
        {screen === 'profile' && (
          <><TopBar title="Profile" /><div className="flex-1 overflow-y-auto p-6"><div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4"><div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center text-xl font-semibold text-teal-700">{user?.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
              <div><p className="text-lg font-semibold text-slate-900">{user?.name}</p><p className="text-sm text-slate-500">{user?.email}</p><p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role} · {user?.tenantName ?? 'EasyVoice'}</p></div>
            </div></div>
            <button onClick={logout} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">Sign out</button>
          </div></div></>
        )}
      </div>
    </div>
  );
}

function Center({ icon, t, d }: { icon: React.ReactNode; t: string; d: string }) {
  return <div className="flex-1 flex items-center justify-center"><EmptyState icon={icon} title={t} description={d} /></div>;
}
