export type CallStatus = 'New' | 'Done' | 'ToDo';
export type UserRole = 'client' | 'tenant' | 'admin';
export type STTProvider = 'azure' | 'gladia';
export type LLMProvider = 'azure';
export type TTSProvider = 'azure' | 'cartesia';
export type FlatSchemaFieldType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  tenantName?: string | null;
}

export interface STTConfig {
  provider: STTProvider;
  language?: string | null;
}

export interface LLMConfig {
  provider: LLMProvider;
  voice?: string | null;
}

export interface TTSConfig {
  provider: TTSProvider;
  voice?: string | null;
  language?: string | null;
}

export interface StructuredVoicePipeline {
  stt?: STTConfig | null;
  llm: LLMConfig;
  tts?: TTSConfig | null;
}

export interface EmailSummaryAction {
  name: string;
  topic: string;
  destination_email: string;
}

export interface CallForwardingAction {
  name: string;
  topic: string;
  destination_phone_number: string;
}

export interface AssistantCoreActions {
  email_summary_actions: EmailSummaryAction[];
  call_forwarding_actions: CallForwardingAction[];
}

export interface DialMenuOption {
  digit: string;
  title: string;
  transfer_number?: string | null;
  information?: string | null;
  continue_conversation?: boolean | null;
}

export interface DialMenu {
  options: DialMenuOption[];
}

export interface Address {
  addressline1: string;
  addressline2?: string | null;
  postcode: string;
  city: string;
  country: string;
}

export interface AdditionalLocationInfo {
  is_barrier_free: boolean;
  has_elevator: boolean;
  has_free_parking: boolean;
  parking_information?: string | null;
  directions?: string | null;
}

export interface Location {
  address: Address;
  additional_info: AdditionalLocationInfo;
}

export interface OpeningTimeSlot {
  start: string;
  end: string;
}

export interface OpeningTimes {
  monday: OpeningTimeSlot[] | null;
  tuesday: OpeningTimeSlot[] | null;
  wednesday: OpeningTimeSlot[] | null;
  thursday: OpeningTimeSlot[] | null;
  friday: OpeningTimeSlot[] | null;
  saturday: OpeningTimeSlot[] | null;
  sunday: OpeningTimeSlot[] | null;
}

export interface Service {
  name: string;
  description?: string | null;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Category {
  name: string;
  prompt: string;
}

export interface VipCallForwarding {
  vip_phone_numbers: string[];
  forwarding_number: string;
}

export interface MCPServer {
  name: string;
  url: string;
}

export interface FlatSchemaEntry {
  field_name: string;
  description?: string | null;
  type?: FlatSchemaFieldType | null;
}

export interface FlatSchema {
  schema_type: 'flat';
  entries: FlatSchemaEntry[];
}

export interface TranscriptAnalysisConfig {
  analysis_prompt?: string | null;
  output_schema: FlatSchema;
}

export interface StructuredContext {
  kind: string;
  location?: Location | null;
  opening_times?: OpeningTimes | null;
  services?: Service[] | null;
  faq?: FAQItem[] | null;
  additional_categories?: Category[] | null;
  vip_call_forwarding?: VipCallForwarding | null;
}

export interface AssistantConfig {
  id: string;
  name: string;
  voice_pipeline: string | StructuredVoicePipeline | null;
  firstMessage: string;
  prompt: string;
  core_actions: AssistantCoreActions;
  dial_menu: DialMenu | null;
  structured_context: StructuredContext | null;
  structured_data_config: TranscriptAnalysisConfig | null;
  success_evaluation_config: TranscriptAnalysisConfig | null;
  mcp_servers?: MCPServer[];
}

export interface Call {
  callId: string;
  assistantCallNumber: number;
  callStatus: CallStatus;
  endedReason: string | null;
  callProgressStatus: string | null;
  createdAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  phoneNumber: string | null;
  callerName: string | null;
  assistantId: string | null;
  recordingUrl: string | null;
  stereoRecordingUrl: string | null;
  summary: string | null;
  transcript: string | null;
  callCategory: string | null;
  structuredData: Record<string, unknown> | null;
  successEvaluation: Record<string, unknown> | null;
}

export interface PhoneNumber {
  id: string;
  number: string;
  assistantId: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  assistantCount: number;
  userCount: number;
}

export interface SMSMessage {
  message: string;
  createdAt: string;
}

export interface TimelineDataPoint {
  date: string;
  calls: number;
  avgDurationSeconds: number;
}
