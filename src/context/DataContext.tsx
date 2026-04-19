import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Call, CallStatus, AssistantConfig, SMSMessage, PhoneNumber } from '@/types/api';
import { CALLS as INIT_CALLS, ASSISTANTS as INIT_ASSISTANTS, SMS_MESSAGES as INIT_SMS, PHONE_NUMBERS as INIT_PHONES } from '@/lib/mockData';

interface DataContextType {
  calls: Call[];
  assistants: AssistantConfig[];
  smsMessages: Record<string, SMSMessage[]>;
  phoneNumbers: PhoneNumber[];

  updateCallStatus: (callId: string, status: CallStatus) => void;
  sendSMS: (callId: string, message: string) => void;

  addAssistant: (a: AssistantConfig) => void;
  updateAssistant: (id: string, updater: (a: AssistantConfig) => AssistantConfig) => void;
  deleteAssistant: (id: string) => void;

  updatePhoneAssignment: (phoneId: string, assistantId: string | null) => void;
  deletePhone: (phoneId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [calls, setCalls] = useState<Call[]>(() => deepClone(INIT_CALLS));
  const [assistants, setAssistants] = useState<AssistantConfig[]>(() => deepClone(INIT_ASSISTANTS));
  const [smsMessages, setSmsMessages] = useState<Record<string, SMSMessage[]>>(() => deepClone(INIT_SMS));
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(() => deepClone(INIT_PHONES));

  const updateCallStatus = useCallback((callId: string, status: CallStatus) => {
    setCalls((prev) => prev.map((c) => (c.callId === callId ? { ...c, callStatus: status } : c)));
  }, []);

  const sendSMS = useCallback((callId: string, message: string) => {
    setSmsMessages((prev) => ({
      ...prev,
      [callId]: [...(prev[callId] ?? []), { message, createdAt: new Date().toISOString() }],
    }));
  }, []);

  const addAssistant = useCallback((a: AssistantConfig) => {
    setAssistants((prev) => [...prev, a]);
  }, []);

  const updateAssistant = useCallback((id: string, updater: (a: AssistantConfig) => AssistantConfig) => {
    setAssistants((prev) => prev.map((a) => (a.id === id ? updater(deepClone(a)) : a)));
  }, []);

  const deleteAssistant = useCallback((id: string) => {
    setAssistants((prev) => prev.filter((a) => a.id !== id));
    // Unassign any phone numbers linked to this assistant
    setPhoneNumbers((prev) => prev.map((p) => (p.assistantId === id ? { ...p, assistantId: null } : p)));
  }, []);

  const updatePhoneAssignment = useCallback((phoneId: string, assistantId: string | null) => {
    setPhoneNumbers((prev) => prev.map((p) => (p.id === phoneId ? { ...p, assistantId } : p)));
  }, []);

  const deletePhone = useCallback((phoneId: string) => {
    setPhoneNumbers((prev) => prev.filter((p) => p.id !== phoneId));
  }, []);

  return (
    <DataContext.Provider value={{
      calls, assistants, smsMessages, phoneNumbers,
      updateCallStatus, sendSMS,
      addAssistant, updateAssistant, deleteAssistant,
      updatePhoneAssignment, deletePhone,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
