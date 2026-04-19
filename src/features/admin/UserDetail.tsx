import { Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/api';

interface UserDetailProps {
  user: UserType;
  onDelete?: () => void;
}

export function UserDetail({ user, onDelete }: UserDetailProps) {
  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'tenant':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'client':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <TopBar title={user.name}>
        {onDelete && (
          <button onClick={onDelete} className="ml-auto px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </TopBar>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* User information */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">User information</p>
                <p className="text-xs text-slate-400 mt-0.5">Basic profile details</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Name</label>
                <input value={user.name} readOnly className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-600" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Email</label>
                <input value={user.email} readOnly className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-600" />
              </div>
            </div>
          </div>

          {/* Role & permissions */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Role & permissions</p>
                <p className="text-xs text-slate-400 mt-0.5">User role and access level</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Role</label>
                <div className={cn('inline-block px-3 py-1.5 text-xs font-medium rounded-lg border', getRoleBadgeClass(user.role))}>
                  {getRoleLabel(user.role)}
                </div>
              </div>
              {user.tenantId && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">Associated tenant</label>
                  <input value={user.tenantName || user.tenantId} readOnly className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-600" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-5 py-2.5 bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-teal-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Save changes
            </button>
            <button className="px-3 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}
