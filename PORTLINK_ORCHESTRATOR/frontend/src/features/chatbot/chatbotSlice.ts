import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';
import type {
  ChatMessage,
  ChatbotState,
  ChatbotResponse,
  MessageIntent,
  WhatIfScenarioInput,
} from './types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ChatbotState = {
  messages: [],
  isTyping: false,
  isConnected: true,
  error: null,
  currentContext: undefined,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

const CHATBOT_ENDPOINT = '/chatbot';

export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (content: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const context = state.chatbot.currentContext;

      console.log('📤 Sending message:', { message: content, context });

      const response = await axiosInstance.post<{success: boolean, data: ChatbotResponse}>(
        `${CHATBOT_ENDPOINT}/chat`,
        {
          message: content,
          context,
        }
      );

      console.log('📥 Received response:', response.data);

      // Backend returns { success, data: { message, intent, ... } }
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Send message error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send message'
      );
    }
  }
);

export const runWhatIfScenario = createAsyncThunk(
  'chatbot/runWhatIfScenario',
  async (scenario: WhatIfScenarioInput, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<ChatbotResponse>(
        `${CHATBOT_ENDPOINT}/what-if`,
        scenario
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to run what-if scenario'
      );
    }
  }
);

export const detectConflicts = createAsyncThunk(
  'chatbot/detectConflicts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ChatbotResponse>(
        `${CHATBOT_ENDPOINT}/detect-conflicts`
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to detect conflicts'
      );
    }
  }
);

export const getOptimizationSuggestions = createAsyncThunk(
  'chatbot/getOptimizationSuggestions',
  async (conflictId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ChatbotResponse>(
        `${CHATBOT_ENDPOINT}/optimize/${conflictId}`
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get optimization suggestions'
      );
    }
  }
);

// ============================================================================
// SLICE
// ============================================================================

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      const message: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(message);
    },

    addAssistantMessage: (
      state,
      action: PayloadAction<{
        content: string;
        intent?: MessageIntent;
        metadata?: ChatMessage['metadata'];
      }>
    ) => {
      const message: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        intent: action.payload.intent,
        metadata: action.payload.metadata,
      };
      state.messages.push(message);
    },

    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    clearMessages: (state) => {
      state.messages = [];
      state.currentContext = undefined;
    },

    clearError: (state) => {
      state.error = null;
    },

    updateContext: (state, action: PayloadAction<ChatbotState['currentContext']>) => {
      state.currentContext = { ...state.currentContext, ...action.payload };
    },
  },

  extraReducers: (builder) => {
    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.isTyping = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isTyping = false;

      console.log('📨 Chatbot response:', action.payload);

      // Ensure we have valid content
      const content = action.payload?.message || 'I received your message but couldn\'t generate a response.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: content,
        timestamp: new Date().toISOString(),
        intent: action.payload?.intent || 'general_query',
        metadata: {
          suggestions: action.payload?.suggestions,
          ...action.payload?.data,
        },
      };

      state.messages.push(assistantMessage);

      // Update context
      if (action.payload.intent) {
        state.currentContext = {
          ...state.currentContext,
          lastIntent: action.payload.intent,
        };
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isTyping = false;
      state.error = action.payload as string;

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${action.payload}`,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(errorMessage);
    });

    // Run what-if scenario
    builder.addCase(runWhatIfScenario.pending, (state) => {
      state.isTyping = true;
      state.error = null;
    });
    builder.addCase(runWhatIfScenario.fulfilled, (state, action) => {
      state.isTyping = false;

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: action.payload.message,
        timestamp: new Date().toISOString(),
        intent: action.payload.intent,
        metadata: {
          suggestions: action.payload.suggestions,
          ...action.payload.data,
        },
      };

      state.messages.push(assistantMessage);
    });
    builder.addCase(runWhatIfScenario.rejected, (state, action) => {
      state.isTyping = false;
      state.error = action.payload as string;

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Failed to run scenario: ${action.payload}`,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(errorMessage);
    });

    // Detect conflicts
    builder.addCase(detectConflicts.fulfilled, (state, action) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: action.payload.message,
        timestamp: new Date().toISOString(),
        intent: action.payload.intent,
        metadata: {
          suggestions: action.payload.suggestions,
          ...action.payload.data,
        },
      };

      state.messages.push(assistantMessage);
    });

    // Get optimization suggestions
    builder.addCase(getOptimizationSuggestions.fulfilled, (state, action) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: action.payload.message,
        timestamp: new Date().toISOString(),
        intent: action.payload.intent,
        metadata: {
          suggestions: action.payload.suggestions,
          ...action.payload.data,
        },
      };

      state.messages.push(assistantMessage);
    });
  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const {
  addUserMessage,
  addAssistantMessage,
  setTyping,
  setConnected,
  clearMessages,
  clearError,
  updateContext,
} = chatbotSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

export const selectChatMessages = (state: any) => state.chatbot.messages;
export const selectIsTyping = (state: any) => state.chatbot.isTyping;
export const selectIsConnected = (state: any) => state.chatbot.isConnected;
export const selectChatError = (state: any) => state.chatbot.error;
export const selectCurrentContext = (state: any) => state.chatbot.currentContext;

// ============================================================================
// REDUCER
// ============================================================================

export default chatbotSlice.reducer;
