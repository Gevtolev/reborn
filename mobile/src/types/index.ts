export interface User {
  id: number;
  phone: string;
}

export interface Profile {
  id: number;
  user_id: number;
  nickname: string | null;
  current_identity: string | null;
  ideal_identity: string | null;
  core_problem: string | null;
  anti_vision: string | null;
  vision: string | null;
  identity_statement: string | null;
  current_stage: 'new_user' | 'exploring' | 'established';
  key_insights: string[] | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ReminderSchedule {
  scheduled_time: string;
  question: string;
}
