import { Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/api';

export interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  items: NavItem[];
  active: string;
  collapsed: boolean;
  onNav: (id: string) => void;
  onProfileClick: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = { client: 'Client', tenant: 'Tenant', admin: 'Admin' };

export function Sidebar({ items, active, collapsed, onNav, onProfileClick }: SidebarProps) {
  const { user } = useAuth();
  const initials = user?.name.split(' ').map((w) => w[0]).join('').slice(0, 2) ?? '';

  return (
    <aside
      className={cn(
        'bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ minWidth: collapsed ? 64 : 240 }}
    >
      <div className={cn('flex items-center gap-2.5 pt-5 pb-4', collapsed ? 'justify-center px-2' : 'px-5')}>
        <img src="/logo.png" alt="EasyVoice" className="w-8 h-8 rounded-lg flex-shrink-0 object-cover" />
        {!collapsed && <span className="text-lg font-semibold text-slate-900">EasyVoice</span>}
      </div>

      <nav className={cn('flex-1 mt-1', collapsed ? 'px-1.5' : 'px-3')}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            title={collapsed ? item.label : undefined}
            className={cn(
              'w-full flex items-center rounded-lg text-sm mb-0.5 transition-all',
              collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2.5',
              active === item.id
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <span className={active === item.id ? 'text-teal-600' : 'text-slate-400'}>
              {item.icon}
            </span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      <div className={cn('border-t border-slate-100 pt-3 pb-4', collapsed ? 'px-1.5' : 'px-4')}>
        <button
          onClick={onProfileClick}
          className={cn(
            'w-full rounded-xl cursor-pointer transition-colors hover:bg-slate-100',
            collapsed ? 'flex justify-center py-2' : 'flex items-center gap-2.5 p-2 bg-slate-50'
          )}
        >
          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-semibold text-teal-700 flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400">{ROLE_LABELS[user?.role ?? 'client']}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
