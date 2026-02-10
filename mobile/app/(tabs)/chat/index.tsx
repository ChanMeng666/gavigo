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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getApiBase } from '@/services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
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
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };

    setInput('');
    setMessages((prev) => [...prev, userMsg]);
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
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Sorry, I could not process your request.',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
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
      {item.role === 'assistant' && (
        <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center mr-2 mt-1">
          <Ionicons name="sparkles" size={16} color="white" />
        </View>
      )}
      <View
        className={`max-w-[75%] px-4 py-3 ${
          item.role === 'user'
            ? 'bg-accent-primary rounded-2xl rounded-br-md'
            : 'bg-surface border border-border rounded-2xl rounded-bl-md'
        }`}
      >
        <Text className="text-white text-sm leading-5">{item.content}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View
        className="px-4 pb-4 border-b border-border"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 rounded-full bg-emerald-500 items-center justify-center">
            <Ionicons name="sparkles" size={20} color="white" />
          </View>
          <View>
            <Text className="text-white font-bold text-lg">AI Assistant</Text>
            <Text className="text-emerald-400 text-xs">
              Powered by OpenAI GPT-4o-mini
            </Text>
          </View>
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
            <View className="h-20 w-20 rounded-full bg-emerald-500/10 items-center justify-center mb-4">
              <Ionicons name="sparkles" size={40} color="#10b981" />
            </View>
            <Text className="text-white font-semibold text-lg mb-2">
              AI Assistant
            </Text>
            <Text className="text-white/40 text-sm text-center px-8">
              Ask me anything about tech, science, or just chat! I'm here to
              help.
            </Text>
          </View>
        }
      />

      {/* Typing indicator */}
      {isLoading && (
        <View className="px-4 pb-2 flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-full bg-emerald-500 items-center justify-center">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
          <View className="bg-surface border border-border px-4 py-2 rounded-2xl rounded-bl-md flex-row gap-1.5">
            <View className="w-2 h-2 bg-white/40 rounded-full" />
            <View className="w-2 h-2 bg-white/40 rounded-full" />
            <View className="w-2 h-2 bg-white/40 rounded-full" />
          </View>
        </View>
      )}

      {/* Input */}
      <View className="p-4 border-t border-border">
        <View className="flex-row gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            editable={!isLoading}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            className="flex-1 bg-surface border border-border text-white rounded-2xl px-4 py-3 text-sm max-h-24"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            className="h-12 w-12 rounded-full bg-emerald-500 items-center justify-center self-end"
            style={{ opacity: isLoading || !input.trim() ? 0.5 : 1 }}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
