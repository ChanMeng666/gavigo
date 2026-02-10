import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getApiBase } from '@/services/api';
import { IconButton } from '@/components/ui';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatEmbedProps {
  isVisible: boolean;
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

export function AIChatEmbed({ isVisible: _isVisible }: AIChatEmbedProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

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
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || 'Sorry, I could not process your request.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not connect to the AI service.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      className={`flex-row mb-3 ${
        item.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <View
        className={`max-w-[78%] px-3 py-2 ${
          item.role === 'user'
            ? 'bg-accent rounded-2xl rounded-br-sm'
            : 'bg-bg-surface border border-border rounded-2xl rounded-bl-sm'
        }`}
      >
        {item.role === 'assistant' && (
          <Ionicons
            name="sparkles"
            size={12}
            color="#a78bfa"
            style={{ position: 'absolute', top: 6, right: 8 }}
          />
        )}
        <Text className="text-body text-text-primary">{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="absolute inset-0 bg-bg-base"
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View className="p-4 border-b border-border-subtle">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-accent items-center justify-center">
            <Ionicons name="sparkles" size={20} color="white" />
          </View>
          <View>
            <Text className="text-body font-semibold text-text-primary">
              AI Assistant
            </Text>
            <Text className="text-micro text-accent-light">Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Ionicons
              name="sparkles-outline"
              size={48}
              color="rgba(167,139,250,0.3)"
            />
            <Text className="text-text-secondary text-body mt-4">
              Start a conversation with AI
            </Text>
            <Text className="text-text-tertiary text-caption mt-1">
              Powered by OpenAI
            </Text>
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
      <View className="p-3 border-t border-border-subtle bg-bg-base">
        <View className="flex-row gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#555568"
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="flex-1 bg-bg-surface text-body text-text-primary rounded-pill px-4 py-2.5"
          />
          <IconButton
            icon="send"
            variant="accent"
            size={18}
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            accessibilityLabel="Send message"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
