import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInUp,
} from 'react-native-reanimated';
import { getApiBase } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { sendUserAction } from '@/services/wsEvents';
import { IconButton, EmptyState, Chip } from '@/components/ui';
import {
  createConversation,
  getConversationMessages,
  persistMessage as persistChatMessage,
  countWords,
} from '@/services/chat';
import { TextInput as RNTextInput } from 'react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
  model?: string;
  word_count?: number;
  status: 'sending' | 'sent' | 'failed';
  failed?: boolean;
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return 'just now';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function TypingDot({ delay }: { delay: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 250 }),
          withTiming(1, { duration: 250 })
        ),
        -1
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [scale, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: '#555568',
        },
      ]}
    />
  );
}

const SUGGESTIONS = [
  'What is GAVIGO?',
  'Tell me about AI',
  'How does orchestration work?',
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { conversationId: routeConversationId } = useLocalSearchParams<{
    conversationId?: string;
  }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const conversationIdRef = useRef<string | null>(null);
  const conversationCreatedRef = useRef(false);
  const userId = useAuthStore((s) => s.firebaseUid);

  // Load conversation on mount (route param or most recent)
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const targetConvId = routeConversationId;

        if (targetConvId) {
          // Load specific conversation from route param
          conversationIdRef.current = targetConvId;
          conversationCreatedRef.current = true;
          const msgs = await getConversationMessages(targetConvId);
          if (msgs.length > 0) {
            setMessages(
              msgs.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                created_at: new Date(m.created_at).getTime(),
                model: m.model ?? undefined,
                word_count: m.word_count ?? undefined,
                status: (m.status as ChatMessage['status']) || 'sent',
              }))
            );
          }
          return;
        }

        // Load most recent conversation
        const { getUserConversations } = await import('@/services/chat');
        const convos = await getUserConversations(userId);
        if (convos.length > 0) {
          conversationIdRef.current = convos[0].id;
          conversationCreatedRef.current = true;
          const msgs = await getConversationMessages(convos[0].id);
          if (msgs.length > 0) {
            setMessages(
              msgs.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                created_at: new Date(m.created_at).getTime(),
                model: m.model ?? undefined,
                word_count: m.word_count ?? undefined,
                status: (m.status as ChatMessage['status']) || 'sent',
              }))
            );
          }
        }
      } catch {
        // Start fresh
      }
    })();
  }, [userId, routeConversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const ensureConversation = useCallback(async (): Promise<string> => {
    if (conversationIdRef.current && conversationCreatedRef.current) {
      return conversationIdRef.current;
    }

    if (userId) {
      const conv = await createConversation(userId);
      if (conv) {
        conversationIdRef.current = conv.id;
        conversationCreatedRef.current = true;
        return conv.id;
      }
    }

    // Fallback to local UUID if DB fails
    const fallbackId = generateUUID();
    conversationIdRef.current = fallbackId;
    return fallbackId;
  }, [userId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage = text.trim();
      const userMsgId = Date.now().toString();
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: userMessage,
        created_at: Date.now(),
        model: 'gpt-4o-mini',
        word_count: countWords(userMessage),
        status: 'sending',
      };

      setInput('');
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      sendUserAction({ action: 'chat_message', screen: 'chat', value: String(userMessage.length) });

      // Ensure conversation exists, then persist
      const convId = await ensureConversation();

      if (userId) {
        const dbId = await persistChatMessage({
          userId,
          conversationId: convId,
          role: 'user',
          content: userMessage,
          model: 'gpt-4o-mini',
          wordCount: countWords(userMessage),
        });
        // Mark as sent
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId
              ? { ...m, id: dbId || userMsgId, status: 'sent' as const }
              : m
          )
        );
      }

      try {
        const response = await fetch(
          `${getApiBase()}/workloads/ai-service/api/chat`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
          }
        );
        const data = await response.json();
        const assistantContent =
          data.response || 'Sorry, I could not process your request.';
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          created_at: Date.now(),
          model: 'gpt-4o-mini',
          word_count: countWords(assistantContent),
          status: 'sent',
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (userId) {
          persistChatMessage({
            userId,
            conversationId: convId,
            role: 'assistant',
            content: assistantContent,
            model: 'gpt-4o-mini',
            wordCount: countWords(assistantContent),
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Sorry, I could not connect to the AI service.',
            created_at: Date.now(),
            status: 'failed',
            failed: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, userId, ensureConversation]
  );

  const handleSend = () => sendMessage(input);

  const handleNewChat = () => {
    const doNewChat = () => {
      setMessages([]);
      conversationIdRef.current = null;
      conversationCreatedRef.current = false;
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Start a new conversation? Current chat is saved.')) {
        doNewChat();
      }
    } else {
      Alert.alert('New Chat', 'Start a new conversation? Current chat is saved.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'New Chat', onPress: doNewChat },
      ]);
    }
  };

  const handleRetry = (msg: ChatMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    const idx = messages.findIndex((m) => m.id === msg.id);
    if (idx > 0) {
      const lastUserMsg = messages[idx - 1];
      if (lastUserMsg.role === 'user') {
        sendMessage(lastUserMsg.content);
      }
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Animated.View
      entering={FadeInUp.duration(200)}
      style={{
        flexDirection: 'row',
        marginBottom: 12,
        justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
      }}
    >
      {item.role === 'assistant' && (
        <View className="w-8 h-8 rounded-full bg-accent items-center justify-center mr-2 mt-1">
          <Ionicons name="sparkles" size={16} color="white" />
        </View>
      )}
      <View className="max-w-[78%]">
        <View
          className={`px-4 py-3 ${
            item.role === 'user'
              ? 'bg-accent rounded-2xl rounded-br-sm'
              : 'bg-bg-surface border border-border rounded-2xl rounded-bl-sm'
          }`}
        >
          <Text className="text-body text-text-primary leading-5">
            {item.content}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginLeft: 4, gap: 4 }}>
          <Text className="text-micro text-text-tertiary">
            {formatTimeAgo(item.created_at)}
          </Text>
          {item.role === 'user' && item.status === 'sent' && (
            <Ionicons name="checkmark" size={10} color="#555568" />
          )}
          {item.role === 'user' && item.status === 'sending' && (
            <Ionicons name="time-outline" size={10} color="#555568" />
          )}
        </View>
        {item.failed && (
          <TouchableOpacity
            onPress={() => handleRetry(item)}
            className="flex-row items-center gap-1 mt-1 ml-1"
            accessibilityRole="button"
            accessibilityLabel="Retry sending message"
          >
            <Ionicons name="alert-circle" size={12} color="#f87171" />
            <Text className="text-micro text-error">Failed to send</Text>
            <Text className="text-micro text-accent-light ml-1">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg-base"
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View
        className="px-4 pb-4 border-b border-border-subtle"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-full bg-accent items-center justify-center">
              <Ionicons name="sparkles" size={20} color="white" />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text
                  className="text-h3 text-text-primary"
                  accessibilityRole="header"
                >
                  AI Assistant
                </Text>
                <View className="w-1.5 h-1.5 rounded-full bg-success" />
              </View>
              <Text className="text-micro text-accent-light">
                Online
              </Text>
            </View>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleNewChat}
              accessibilityRole="button"
              accessibilityLabel="New chat"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(124,58,237,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="create-outline" size={18} color="#7c3aed" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center pt-20">
            <EmptyState
              icon="sparkles"
              title="Start a conversation"
              subtitle="Ask me anything about tech, science, or AI"
              compact
            />
            <View className="flex-row flex-wrap gap-2 mt-4 justify-center px-4">
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onPress={() => sendMessage(s)}
                />
              ))}
            </View>
          </View>
        }
      />

      {/* Typing indicator */}
      {isLoading && (
        <View className="px-4 pb-2 flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-accent items-center justify-center">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
          <View className="bg-bg-surface border border-border px-4 py-2 rounded-2xl rounded-bl-sm flex-row gap-1.5">
            <TypingDot delay={0} />
            <TypingDot delay={150} />
            <TypingDot delay={300} />
          </View>
        </View>
      )}

      {/* Input */}
      <View className="p-4 border-t border-border-subtle">
        <View className="flex-row gap-2">
          <RNTextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor="#555568"
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            accessibilityLabel="Message input"
            className="flex-1 bg-bg-surface border border-border text-text-primary rounded-pill px-4 py-3 text-body max-h-24"
          />
          <IconButton
            icon="send"
            variant="accent"
            size={20}
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            accessibilityLabel="Send message"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
