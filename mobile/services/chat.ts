import { supabase } from './supabase';
import type { Database } from '@/types/supabase';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];

export async function createConversation(
  userId: string,
  model = 'gpt-4o-mini'
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, model })
    .select()
    .single();

  if (error) {
    console.warn('Failed to create conversation:', error.message);
    return null;
  }
  return data;
}

export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('Failed to fetch conversations:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('Failed to fetch messages:', error.message);
    return [];
  }
  return data ?? [];
}

export async function persistMessage({
  userId,
  conversationId,
  role,
  content,
  model,
  wordCount,
}: {
  userId: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  wordCount?: number;
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      role,
      content,
      model,
      word_count: wordCount,
      status: 'sent',
    })
    .select('id')
    .single();

  if (error) {
    console.warn('Failed to persist message:', error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function updateMessageStatus(
  messageId: string,
  status: 'sending' | 'sent' | 'failed'
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ status })
    .eq('id', messageId);

  if (error) {
    console.warn('Failed to update message status:', error.message);
  }
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
