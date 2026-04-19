import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types/api';

interface UsersListProps {
  users: UserType[];
  selectedUserId?: string;
  onSelect: (userId: string) => void;
}

export function UsersList({ users, selectedUserId, onSelect }: UsersListProps) {
  const [search, setSearch] = useState('');

  const filteredUsers = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="w-80 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-100">
        <p className="text-base font-medium text-slate-900 mb-3">Users</p>
        <div className="relative">
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length ? (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelect(u.id)}
              className={cn(
                'px-3 py-2 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50',
                selectedUserId === u.id ? 'bg-teal-50' : ''
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-3">
              <User className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No users found</p>
            <p className="text-xs text-slate-400">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
