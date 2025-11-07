// ============================================================================
// CHATBOT TYPES
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageIntent =
  | 'general_query'
  | 'schedule_query'
  | 'ship_status'
  | 'berth_availability'
  | 'what_if_scenario'
  | 'conflict_detection'
  | 'kpi_query'
  | 'report_issue'
  | 'optimization_request'
  | 'unknown';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO 8601 string format
  intent?: MessageIntent;
  metadata?: {
    shipId?: string;
    scheduleId?: string;
    conflictId?: string;
    suggestions?: string[];
    kpiData?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

export interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;
  currentContext?: {
    lastIntent?: MessageIntent;
    relatedEntities?: string[];
    [key: string]: unknown;
  };
}

export interface ChatbotResponse {
  message: string;
  intent: MessageIntent;
  suggestions?: string[];
  data?: Record<string, unknown>;
  actions?: ChatbotAction[];
}

export interface ChatbotAction {
  type: 'navigation' | 'execute' | 'display';
  payload: Record<string, unknown>;
}

export interface WhatIfScenarioInput {
  description: string;
  parameters: {
    shipId?: string;
    delay?: number; // minutes
    berthChange?: string;
    craneOutage?: {
      assetId: string;
      startTime: string;
      endTime: string;
    };
    [key: string]: unknown;
  };
}
