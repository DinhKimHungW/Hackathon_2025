import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  ExpandMore,
  ExpandLess,
  Lightbulb,
  AutoGraph,
  Warning,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  sendMessage,
  addUserMessage,
  selectChatMessages,
  selectIsTyping,
  selectIsConnected,
  clearMessages,
} from './chatbotSlice';
import type { ChatMessage as ChatMessageType } from './types';

// ============================================================================
// MESSAGE COMPONENT
// ============================================================================

interface MessageProps {
  message: ChatMessageType;
}

function ChatMessageBubble({ message }: MessageProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const isUser = message.role === 'user';

  const getIntentIcon = () => {
    switch (message.intent) {
      case 'what_if_scenario':
        return <AutoGraph fontSize="small" />;
      case 'conflict_detection':
        return <Warning fontSize="small" color="warning" />;
      case 'optimization_request':
        return <Lightbulb fontSize="small" color="primary" />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {!isUser && (
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <SmartToy fontSize="small" />
        </Avatar>
      )}

      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            ...(isUser && {
              borderTopRightRadius: 4,
            }),
            ...(!isUser && {
              borderTopLeftRadius: 4,
            }),
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>

          {!isUser && message.intent && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                size="small"
                icon={getIntentIcon() || undefined}
                label={message.intent.replace(/_/g, ' ')}
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Box>
          )}
        </Paper>

        {!isUser && message.metadata?.suggestions && (
          <>
            <IconButton
              size="small"
              onClick={() => setShowMetadata(!showMetadata)}
              sx={{ mt: 0.5 }}
            >
              {showMetadata ? <ExpandLess /> : <ExpandMore />}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {message.metadata.suggestions.length} suggestions
              </Typography>
            </IconButton>

            <Collapse in={showMetadata}>
              <List dense sx={{ bgcolor: 'action.hover', borderRadius: 1, mt: 1 }}>
                {message.metadata.suggestions.map((suggestion, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={suggestion}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5, textAlign: isUser ? 'right' : 'left' }}
        >
          {format(new Date(message.timestamp), 'HH:mm')}
        </Typography>
      </Box>

      {isUser && (
        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
          <Person fontSize="small" />
        </Avatar>
      )}
    </Box>
  );
}

// ============================================================================
// MAIN CHATBOT COMPONENT
// ============================================================================

export default function ChatbotWidget() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectChatMessages);
  const isTyping = useAppSelector(selectIsTyping);
  const isConnected = useAppSelector(selectIsConnected);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message to state
    dispatch(addUserMessage(userMessage));

    // Send to backend
    await dispatch(sendMessage(userMessage));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    'Show current schedule',
    'Check for conflicts',
    'What if MV Ocean Star delays 2 hours?',
    'Show berth availability',
    'Display KPIs',
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SmartToy />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">PortLink AI Assistant</Typography>
          <Typography variant="caption">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Typography>
        </Box>
        <Tooltip title="Clear chat">
          <IconButton
            size="small"
            onClick={() => dispatch(clearMessages())}
            sx={{ color: 'inherit' }}
          >
            <Typography variant="caption">Clear</Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Divider />

      {/* Quick Actions */}
      {messages.length === 0 && (
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Quick actions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {quickActions.map((action, idx) => (
              <Chip
                key={idx}
                label={action}
                size="small"
                onClick={() => handleQuickAction(action)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.50',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box>
              <SmartToy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Welcome to PortLink AI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask me anything about schedules, ships, berths, or run what-if scenarios!
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                  <SmartToy fontSize="small" />
                </Avatar>
                <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <CircularProgress size={8} />
                    <CircularProgress size={8} />
                    <CircularProgress size={8} />
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message... (Press Enter to send)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            multiline
            maxRows={3}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!inputValue.trim() || !isConnected || isTyping}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
