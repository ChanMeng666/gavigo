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
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { sendUserAction } from '@/services/wsEvents';
import { IconButton, EmptyState, Chip } from '@/components/ui';
import { TextInput as RNTextInput } from 'react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: number;
  failed?: boolean;
}

function formatTimeAgo(timestamp: number): string {
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const conversationIdRef = useRef(generateUUID());
  const userId = useAuthStore((s) => s.firebaseUid);

  // Load most recent conversation on mount
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        // Get the most recent conversation_id for this user
        const { data: recent } = await supabase
          .from('chat_messages')
          .select('conversation_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recent) {
          conversationIdRef.current = recent.conversation_id;

          // Load all messages for that conversation
          const { data: msgs } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', userId)
            .eq('conversation_id', recent.conversation_id)
            .order('created_at', { ascending: true });

          if (msgs && msgs.length > 0) {
            setMessages(
              msgs.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                created_at: new Date(m.created_at).getTime(),
              }))
            );
          }
        }
      } catch {
        // Start fresh
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const persistMessage = useCallback(
    async (role: 'user' | 'assistant', content: string) => {
      if (!userId) return;
      try {
        await supabase.from('chat_messages').insert({
          user_id: userId,
          conversation_id: conversationIdRef.current,
          role,
          content,
        });
      } catch {
        // Non-critical
      }
    },
    [userId]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage = text.trim();
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        created_at: Date.now(),
      };

      setInput('');
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // Track chat message (length only, not content — privacy)
      sendUserAction({ action: 'chat_message', screen: 'chat', value: String(userMessage.length) });

      // Persist user message
      persistMessage('user', userMessage);

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
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Persist assistant message
        persistMessage('assistant', assistantContent);
      } catch {
        const failContent = 'Sorry, I could not connect to the AI service.';
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: failContent,
            created_at: Date.now(),
            failed: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, persistMessage]
  );

  const handleSend = () => sendMessage(input);

  const handleClear = () => {
    const doClear = () => {
      setMessages([]);
      // New conversation ID (old messages preserved in DB)
      conversationIdRef.current = generateUUID();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Start a new conversation?')) {
        doClear();
      }
    } else {
      Alert.alert('Clear Chat', 'Start a new conversation?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: doClear },
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
        <Text className="text-micro text-text-tertiary mt-0.5 ml-1">
          {formatTimeAgo(item.created_at)}
        </Text>
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
              onPress={handleClear}
              accessibilityRole="button"
              accessibilityLabel="Clear chat"
            >
              <Text className="text-caption text-text-secondary">Clear</Text>
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
