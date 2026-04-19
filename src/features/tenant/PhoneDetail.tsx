import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { TopBar } from '@/components/layout/TopBar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { INPUT_CLASS } from '@/lib/constants';
import type { PhoneNumber } from '@/types/api';

interface Props {
  phone: PhoneNumber;
  onDeleted?: () => void;
}

export function PhoneDetail({ phone, onDeleted }: Props) {
  const { assistants, updatePhoneAssignment, deletePhone } = useData();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const assignedName = assistants.find((a) => a.id === phone.assistantId)?.name;

  const handleAssign = (assistantId: string) => {
    const newId = assistantId || null;
    updatePhoneAssignment(phone.id, newId);
    toast(newId ? `Assigned to ${assistants.find((a) => a.id === newId)?.name}` : 'Phone unassigned');
  };

  const handleDelete = () => {
    deletePhone(phone.id);
    toast(`${phone.number} deleted`, 'info');
    setShowDeleteConfirm(false);
    onDeleted?.();
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title={phone.number} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Phone details</p>
              <p className="text-xs text-slate-400 mt-0.5">Manage assignment and status</p>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Number</label>
                <p className="text-base font-medium text-slate-900">{phone.number}</p>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                {phone.assistantId ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium">Idle</span>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Assigned to</label>
                <select
                  value={phone.assistantId ?? ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">— Unassign —</option>
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
          >
            Delete phone number
          </button>
        </div>
      </div>
      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${phone.number}?`}
          message={phone.assistantId ? `This number is currently assigned to ${assignedName}. Deleting it will unassign it.` : 'This phone number will be permanently removed.'}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
