import type {
  AssistantConfig, Call, PhoneNumber, Tenant, SMSMessage, User, TimelineDataPoint,
} from '@/types/api';

// ── Users ──────────────────────────────────────────
export const USERS: Record<string, User> = {
  client: {
    id: 'u1', email: 'dr.mueller@innsbruck-medical.at', name: 'Dr. Sarah Müller',
    role: 'client', tenantId: 't1', tenantName: 'Innsbruck Medical',
  },
  tenant: {
    id: 'u2', email: 'admin@innsbruck-medical.at', name: 'Markus Hofer',
    role: 'tenant', tenantId: 't1', tenantName: 'Innsbruck Medical',
  },
  admin: {
    id: 'u3', email: 'ops@easyvoice.ai', name: 'Ehsan Askari',
    role: 'admin', tenantId: null, tenantName: null,
  },
};

// ── Assistants ──────────────────────────────────────
export const ASSISTANTS: AssistantConfig[] = [
  {
    id: 'a1', name: 'Reception Bot', voice_pipeline: 'default-de',
    firstMessage: 'Hallo, willkommen bei der Praxis Dr. Müller! Wie kann ich Ihnen helfen?',
    prompt: 'You are a friendly and professional reception assistant for a medical practice in Innsbruck. Help callers with appointments, general questions, and route complaints appropriately. Always be polite and speak German unless the caller switches to English.',
    core_actions: {
      email_summary_actions: [
        { name: 'Appointment summary', topic: 'Appointments', destination_email: 'termine@innsbruck-medical.at' },
        { name: 'Complaint alert', topic: 'Complaints', destination_email: 'manager@innsbruck-medical.at' },
      ],
      call_forwarding_actions: [
        { name: 'Emergency forward', topic: 'Emergencies', destination_phone_number: '+43 512 999000' },
      ],
    },
    dial_menu: {
      options: [
        { digit: '1', title: 'Book appointment', continue_conversation: true },
        { digit: '2', title: 'Opening hours', information: 'We are open Monday to Friday from 8 AM to 6 PM, and Saturday from 9 AM to 1 PM.' },
        { digit: '3', title: 'Speak to a person', transfer_number: '+43 512 123456' },
        { digit: '0', title: 'Repeat menu', information: 'Press 1 for appointments, 2 for opening hours, 3 to speak to a person.' },
      ],
    },
    structured_context: {
      kind: 'medical_practice',
      location: {
        address: { addressline1: 'Innrain 52', addressline2: null, postcode: '6020', city: 'Innsbruck', country: 'Austria' },
        additional_info: { is_barrier_free: true, has_elevator: true, has_free_parking: true, parking_information: 'Free parking in front of building', directions: 'Near University of Innsbruck' },
      },
      opening_times: {
        monday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }],
        tuesday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }],
        wednesday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }],
        thursday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }],
        friday: [{ start: '08:00', end: '12:00' }, { start: '13:00', end: '16:00' }],
        saturday: [{ start: '09:00', end: '13:00' }],
        sunday: null,
      },
      services: [
        { name: 'General consultation', description: 'Standard medical consultation and check-up' },
        { name: 'Blood work', description: 'Laboratory blood tests and analysis' },
        { name: 'Vaccination', description: 'Standard and travel vaccinations' },
        { name: 'Health check', description: 'Comprehensive annual health screening' },
      ],
      faq: [
        { question: 'Do I need an appointment?', answer: 'Yes, we recommend booking in advance. Walk-ins accepted based on availability.' },
        { question: 'Do you accept e-card?', answer: 'Yes, we accept all Austrian health insurance cards. Please bring your card.' },
        { question: 'Where can I park?', answer: 'Free parking is available in front of the building.' },
        { question: 'How do I cancel an appointment?', answer: 'Please call us at least 24 hours in advance to cancel or reschedule.' },
      ],
      additional_categories: [
        { name: 'Emergency', prompt: 'Classify as emergency if caller reports severe symptoms' },
      ],
      vip_call_forwarding: {
        vip_phone_numbers: ['+43 660 1111111', '+43 660 2222222'],
        forwarding_number: '+43 512 999000',
      },
    },
    structured_data_config: {
      output_schema: {
        schema_type: 'flat',
        entries: [
          { field_name: 'caller_name', type: 'string', description: 'Full name of the caller' },
          { field_name: 'appointment_date', type: 'string', description: 'Requested appointment date' },
          { field_name: 'appointment_time', type: 'string', description: 'Requested appointment time' },
          { field_name: 'reason', type: 'string', description: 'Reason for the call or appointment' },
        ],
      },
    },
    success_evaluation_config: {
      analysis_prompt: 'Evaluate whether the call achieved its purpose. Score from 0 to 1.',
      output_schema: {
        schema_type: 'flat',
        entries: [
          { field_name: 'score', type: 'number', description: 'Success score 0-1' },
          { field_name: 'outcome', type: 'string', description: 'Brief outcome description' },
        ],
      },
    },
    mcp_servers: [{ name: 'Calendar API', url: 'https://cal.innsbruck-medical.at/mcp' }],
  },
  {
    id: 'a2', name: 'Service Desk', voice_pipeline: 'default-en',
    firstMessage: 'Hello, thank you for calling Innsbruck Medical Service Desk. How may I assist you?',
    prompt: 'You are a helpful service desk assistant. Handle inquiries about services, pricing, and general information. Speak English.',
    core_actions: {
      email_summary_actions: [{ name: 'Service inquiry', topic: 'Service questions', destination_email: 'service@innsbruck-medical.at' }],
      call_forwarding_actions: [],
    },
    dial_menu: null, structured_context: null,
    structured_data_config: null, success_evaluation_config: null, mcp_servers: [],
  },
  {
    id: 'a3', name: 'After Hours', voice_pipeline: 'default-de',
    firstMessage: 'Danke für Ihren Anruf. Unser Büro ist derzeit geschlossen.',
    prompt: 'You are an after-hours assistant for Alpine Services. Inform callers of business hours and take messages for urgent matters.',
    core_actions: {
      email_summary_actions: [{ name: 'After hours message', topic: 'After hours', destination_email: 'info@alpine-services.at' }],
      call_forwarding_actions: [{ name: 'Urgent callback', topic: 'Urgent', destination_phone_number: '+43 664 8887766' }],
    },
    dial_menu: null, structured_context: null,
    structured_data_config: null, success_evaluation_config: null, mcp_servers: [],
  },
];

// ── Calls ──────────────────────────────────────────
export const CALLS: Call[] = [
  {
    callId: 'c1', assistantCallNumber: 47, callStatus: 'New', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-29T14:20:00Z',
    startedAt: '2026-03-29T14:23:00Z', endedAt: '2026-03-29T14:26:12Z',
    phoneNumber: '+43 660 1234567', callerName: 'Maria Schmidt', assistantId: 'a1',
    recordingUrl: '/audio/c1.mp3', stereoRecordingUrl: '/audio/c1-stereo.mp3',
    summary: 'Caller wanted to book an appointment for next Tuesday. The assistant confirmed availability at 10:00 AM and scheduled the appointment.',
    transcript: 'AI: Hallo, willkommen bei der Praxis Dr. Müller! Wie kann ich Ihnen helfen?\nCaller: Hallo, ich möchte gerne einen Termin für nächste Woche vereinbaren.\nAI: Natürlich! Ich habe Dienstag und Donnerstag noch freie Termine. Welcher Tag passt Ihnen besser?\nCaller: Dienstag wäre super.\nAI: Sehr gut. Um 10 Uhr hätte ich noch einen Platz frei. Passt das?\nCaller: Ja, perfekt.\nAI: Wunderbar! Ihr Termin ist für Dienstag um 10 Uhr bestätigt. Auf Wiederhören!',
    callCategory: 'Appointment',
    structuredData: { caller_name: 'Maria Schmidt', appointment_date: '2026-04-01', appointment_time: '10:00', reason: 'General consultation' },
    successEvaluation: { score: 0.95, outcome: 'Appointment booked successfully' },
  },
  {
    callId: 'c2', assistantCallNumber: 46, callStatus: 'Done', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-29T11:00:00Z',
    startedAt: '2026-03-29T11:05:00Z', endedAt: '2026-03-29T11:08:33Z',
    phoneNumber: '+43 664 9876543', callerName: 'Thomas Weber', assistantId: 'a1',
    recordingUrl: '/audio/c2.mp3', stereoRecordingUrl: '/audio/c2-stereo.mp3',
    summary: 'Caller asked about opening hours and parking. All info provided.',
    transcript: 'AI: Hallo, willkommen!\nCaller: Wann haben Sie geöffnet?\nAI: Montag bis Freitag 8–18 Uhr, Samstag 9–13 Uhr.\nCaller: Gibt es Parkplätze?\nAI: Ja, kostenlose Parkplätze vor dem Gebäude.\nCaller: Danke!',
    callCategory: 'Information', structuredData: null,
    successEvaluation: { score: 0.9, outcome: 'Information provided' },
  },
  {
    callId: 'c3', assistantCallNumber: 45, callStatus: 'ToDo', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-28T16:40:00Z',
    startedAt: '2026-03-28T16:45:00Z', endedAt: '2026-03-28T16:47:20Z',
    phoneNumber: '+43 676 5551234', callerName: 'Anna Berger', assistantId: 'a1',
    recordingUrl: '/audio/c3.mp3', stereoRecordingUrl: null,
    summary: 'Caller reported billing issue. Escalated to accounting for follow-up.',
    transcript: 'AI: Hallo!\nCaller: Ich habe eine falsche Rechnung bekommen.\nAI: Darf ich Ihre Kundennummer notieren?\nCaller: 4521.\nAI: Danke. Jemand wird sich innerhalb von 24 Stunden melden.',
    callCategory: 'Complaint',
    structuredData: { customer_number: '4521', issue: 'Incorrect invoice' },
    successEvaluation: { score: 0.7, outcome: 'Escalated to accounting' },
  },
  {
    callId: 'c4', assistantCallNumber: 23, callStatus: 'New', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-28T09:00:00Z',
    startedAt: '2026-03-28T09:12:00Z', endedAt: '2026-03-28T09:15:44Z',
    phoneNumber: '+43 699 3334455', callerName: 'Josef Huber', assistantId: 'a2',
    recordingUrl: '/audio/c4.mp3', stereoRecordingUrl: '/audio/c4-stereo.mp3',
    summary: 'Booked consultation for Friday at 2 PM.',
    transcript: 'AI: Hello, Service Desk.\nCaller: I need a consultation for Friday.\nAI: 2 PM available. Confirmed.',
    callCategory: 'Appointment',
    structuredData: { appointment_date: '2026-04-03', appointment_time: '14:00' },
    successEvaluation: { score: 0.92, outcome: 'Booked' },
  },
  {
    callId: 'c5', assistantCallNumber: 22, callStatus: 'Done', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-27T13:25:00Z',
    startedAt: '2026-03-27T13:30:00Z', endedAt: '2026-03-27T13:33:10Z',
    phoneNumber: '+43 660 7778899', callerName: 'Eva Maier', assistantId: 'a2',
    recordingUrl: '/audio/c5.mp3', stereoRecordingUrl: null,
    summary: 'Asked about services and pricing for health check.',
    transcript: 'AI: How can I help?\nCaller: What services do you offer?\nAI: General consultations, blood work, vaccinations, health checks.\nCaller: How much is a health check?\nAI: €120. Want to schedule one?\nCaller: Not today, thanks.',
    callCategory: 'Service inquiry', structuredData: null,
    successEvaluation: { score: 0.85, outcome: 'Information provided' },
  },
  {
    callId: 'c6', assistantCallNumber: 44, callStatus: 'ToDo', endedReason: 'assistant-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-27T09:50:00Z',
    startedAt: '2026-03-27T10:00:00Z', endedAt: '2026-03-27T10:04:55Z',
    phoneNumber: '+43 664 1112233', callerName: 'Klaus Pichler', assistantId: 'a1',
    recordingUrl: '/audio/c6.mp3', stereoRecordingUrl: '/audio/c6-stereo.mp3',
    summary: 'Needs callback regarding insurance documents.',
    transcript: 'AI: Hallo!\nCaller: Ich brauche einen Rückruf wegen Versicherungsunterlagen.\nAI: Unter welcher Nummer?\nCaller: 0664 1112233.\nAI: Notiert. Jemand meldet sich.',
    callCategory: 'Follow-up',
    structuredData: { callback_reason: 'Insurance docs' },
    successEvaluation: { score: 0.6, outcome: 'Pending callback' },
  },
  {
    callId: 'c7', assistantCallNumber: 5, callStatus: 'Done', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-26T18:30:00Z',
    startedAt: '2026-03-26T18:32:00Z', endedAt: '2026-03-26T18:33:45Z',
    phoneNumber: '+43 676 4445566', callerName: 'Lisa Gruber', assistantId: 'a3',
    recordingUrl: '/audio/c7.mp3', stereoRecordingUrl: null,
    summary: 'After-hours call. Informed of business hours.',
    transcript: 'AI: Unser Büro ist geschlossen.\nCaller: Wann wieder geöffnet?\nAI: Mo-Fr 8-18 Uhr.\nCaller: Danke.',
    callCategory: 'After hours', structuredData: null,
    successEvaluation: { score: 0.8, outcome: 'Informed of hours' },
  },
  {
    callId: 'c8', assistantCallNumber: 4, callStatus: 'New', endedReason: 'customer-ended',
    callProgressStatus: 'completed', createdAt: '2026-03-26T19:10:00Z',
    startedAt: '2026-03-26T19:12:00Z', endedAt: '2026-03-26T19:14:30Z',
    phoneNumber: '+43 699 2223344', callerName: 'Stefan Eder', assistantId: 'a3',
    recordingUrl: '/audio/c8.mp3', stereoRecordingUrl: null,
    summary: 'Urgent after-hours call. Forwarded to emergency.',
    transcript: 'AI: Büro geschlossen.\nCaller: Dringend!\nAI: Verbinde mit Notfall-Service.',
    callCategory: 'After hours',
    structuredData: { urgency: 'high' },
    successEvaluation: { score: 0.75, outcome: 'Forwarded to emergency' },
  },
];

// ── Phone Numbers ──────────────────────────────────
export const PHONE_NUMBERS: PhoneNumber[] = [
  { id: 'p1', number: '+43 512 123456', assistantId: 'a1' },
  { id: 'p2', number: '+43 512 654321', assistantId: 'a2' },
  { id: 'p3', number: '+43 512 111222', assistantId: null },
  { id: 'p4', number: '+43 512 333444', assistantId: 'a3' },
];

// ── Tenants ──────────────────────────────────────────
export const TENANTS: Tenant[] = [
  { id: 't1', name: 'Innsbruck Medical', assistantCount: 2, userCount: 4 },
  { id: 't2', name: 'Alpine Services', assistantCount: 1, userCount: 2 },
];

// ── SMS Messages ──────────────────────────────────────
export const SMS_MESSAGES: Record<string, SMSMessage[]> = {
  c1: [
    { message: 'Erinnerung: Ihr Termin ist für Dienstag, 1. April um 10:00 Uhr bestätigt.', createdAt: '2026-03-29T14:30:00Z' },
  ],
  c3: [
    { message: 'Ihre Beschwerde wurde weitergeleitet. Ref: 4521', createdAt: '2026-03-28T17:00:00Z' },
    { message: 'Update: Rechnung korrigiert. Neue Rechnung per Post.', createdAt: '2026-03-29T10:15:00Z' },
  ],
};

// ── Assistant → Tenant mapping ──────────────────────
export const ASSISTANT_TENANT_MAP: Record<string, string> = {
  a1: 't1', a2: 't1', a3: 't2',
};

// ── Timeline data (30 days for dashboard charts) ────
const seed = (i: number) => ((i * 7 + 13) % 17) + 2;
const seedDur = (i: number) => ((i * 11 + 5) % 13) * 10 + 90;

export const TIMELINE_DATA: TimelineDataPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date('2026-03-01');
  d.setDate(d.getDate() + i);
  return {
    date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    calls: seed(i),
    avgDurationSeconds: seedDur(i),
  };
});

// ── Helper functions ──────────────────────────────────
export function getAssistantName(id: string): string {
  return ASSISTANTS.find((a) => a.id === id)?.name ?? '—';
}

export function getAssistantById(id: string): AssistantConfig | undefined {
  return ASSISTANTS.find((a) => a.id === id);
}

export function getCallsForAssistant(assistantId: string): Call[] {
  return CALLS.filter((c) => c.assistantId === assistantId);
}

export function getCallsForTenant(tenantId: string): Call[] {
  const aids = Object.entries(ASSISTANT_TENANT_MAP)
    .filter(([, tid]) => tid === tenantId)
    .map(([aid]) => aid);
  return CALLS.filter((c) => c.assistantId && aids.includes(c.assistantId));
}

export function getAssistantsForTenant(tenantId: string): AssistantConfig[] {
  const aids = Object.entries(ASSISTANT_TENANT_MAP)
    .filter(([, tid]) => tid === tenantId)
    .map(([aid]) => aid);
  return ASSISTANTS.filter((a) => aids.includes(a.id));
}

export function getPhoneForAssistant(assistantId: string): PhoneNumber | undefined {
  return PHONE_NUMBERS.find((p) => p.assistantId === assistantId);
}
