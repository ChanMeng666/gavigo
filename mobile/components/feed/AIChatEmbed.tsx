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
import { getApiBase } from '@/services/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatEmbedProps {
  isVisible: boolean;
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
        className={`max-w-[80%] px-3 py-2 ${
          item.role === 'user'
            ? 'bg-emerald-500 rounded-2xl rounded-br-md'
            : 'bg-white/10 rounded-2xl rounded-bl-md'
        }`}
      >
        <Text className="text-white text-sm">{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-black"
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View className="p-4 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-emerald-500 items-center justify-center">
            <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          </View>
          <View>
            <Text className="text-white font-semibold text-sm">
              AI Assistant
            </Text>
            <Text className="text-emerald-400 text-xs">Online</Text>
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
              name="chatbubble-ellipses-outline"
              size={48}
              color="rgba(255,255,255,0.2)"
            />
            <Text className="text-white/40 text-sm mt-4">
              Start a conversation with AI
            </Text>
            <Text className="text-white/30 text-xs mt-1">
              Powered by OpenAI
            </Text>
          </View>
        }
      />

      {/* Loading indicator */}
      {isLoading && (
        <View className="px-4 pb-2">
          <View className="flex-row justify-start">
            <View className="bg-white/10 px-4 py-2 rounded-2xl rounded-bl-md flex-row gap-1">
              <View className="w-2 h-2 bg-white/50 rounded-full" />
              <View className="w-2 h-2 bg-white/50 rounded-full" />
              <View className="w-2 h-2 bg-white/50 rounded-full" />
            </View>
          </View>
        </View>
      )}

      {/* Input */}
      <View className="p-3 border-t border-white/10 bg-black/50">
        <View className="flex-row gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="flex-1 bg-white/10 text-white rounded-full px-4 py-2.5 text-sm"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 rounded-full bg-emerald-500 items-center justify-center"
            style={{ opacity: isLoading || !input.trim() ? 0.5 : 1 }}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
